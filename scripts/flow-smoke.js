/* eslint-disable no-console */
const { io } = require('socket.io-client');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const now = Date.now();

const users = {
  one: {
    fullName: 'Smoke User One',
    email: `smoke.one.${now}@example.com`,
    password: 'Passw0rd!123'
  },
  two: {
    fullName: 'Smoke User Two',
    email: `smoke.two.${now}@example.com`,
    password: 'Passw0rd!123'
  }
};

const state = {
  userOne: null,
  userTwo: null,
  tokenOne: null,
  tokenTwo: null,
  eventId: null
};

async function requestJson(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} failed (${response.status}): ${JSON.stringify(data)}`);
  }

  return data;
}

async function runStep(label, fn) {
  process.stdout.write(`- ${label} ... `);
  try {
    await fn();
    console.log('PASS');
  } catch (error) {
    console.log('FAIL');
    console.error(`  ${error.message}`);
    throw error;
  }
}

async function testRealtimeMessage() {
  return new Promise((resolve, reject) => {
    const tokenOne = state.tokenOne;
    const tokenTwo = state.tokenTwo;

    const socketOne = io(BASE_URL, {
      auth: { token: tokenOne },
      transports: ['websocket']
    });

    const socketTwo = io(BASE_URL, {
      auth: { token: tokenTwo },
      transports: ['websocket']
    });

    const timeout = setTimeout(() => {
      socketOne.disconnect();
      socketTwo.disconnect();
      reject(new Error('Realtime message timeout')); 
    }, 10000);

    socketTwo.on('receive_message', (message) => {
      if (message && message.content === 'socket smoke message') {
        clearTimeout(timeout);
        socketOne.disconnect();
        socketTwo.disconnect();
        resolve();
      }
    });

    socketTwo.on('connect_error', (err) => {
      clearTimeout(timeout);
      socketOne.disconnect();
      socketTwo.disconnect();
      reject(new Error(`Socket userTwo connect failed: ${err.message}`));
    });

    socketOne.on('connect_error', (err) => {
      clearTimeout(timeout);
      socketOne.disconnect();
      socketTwo.disconnect();
      reject(new Error(`Socket userOne connect failed: ${err.message}`));
    });

    socketOne.on('connect', () => {
      socketOne.emit('send_message', {
        receiverId: state.userTwo._id,
        content: 'socket smoke message',
        group: false
      });
    });
  });
}

async function maybeTestUpload() {
  const required = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_S3_BUCKET'];
  const missing = required.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    console.log(`- File upload (S3) ... SKIPPED (missing env: ${missing.join(', ')})`);
    return;
  }

  process.stdout.write('- File upload (S3) ... ');
  try {
    const form = new FormData();
    form.append('title', 'Smoke Resource');
    form.append('description', 'smoke upload');
    form.append('category', 'training');
    form.append('file', new Blob(['smoke file content'], { type: 'text/plain' }), 'smoke.txt');

    const response = await fetch(`${BASE_URL}/api/resources/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.tokenOne}`
      },
      body: form
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Upload failed (${response.status}): ${text}`);
    }

    console.log('PASS');
  } catch (error) {
    console.log('FAIL');
    throw error;
  }
}

async function main() {
  console.log(`Running smoke flows against ${BASE_URL}`);

  await runStep('Authentication - register user one', async () => {
    await requestJson('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(users.one)
    });
  });

  await runStep('Authentication - register user two', async () => {
    await requestJson('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(users.two)
    });
  });

  await runStep('Authentication - login and token returned', async () => {
    const one = await requestJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: users.one.email, password: users.one.password })
    });

    const two = await requestJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: users.two.email, password: users.two.password })
    });

    if (!one.token || !two.token) {
      throw new Error('Missing JWT token in login response');
    }

    state.userOne = one.user;
    state.userTwo = two.user;
    state.tokenOne = one.token;
    state.tokenTwo = two.token;
  });

  await runStep('Alumni Directory - fetch users/search', async () => {
    const usersRes = await requestJson('/api/users/search?name=smoke&page=1&limit=5', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${state.tokenOne}`
      }
    });

    if (!Array.isArray(usersRes.users) || usersRes.users.length < 2) {
      throw new Error('Expected at least 2 users in search response');
    }
  });

  await runStep('Events - create event', async () => {
    const event = await requestJson('/api/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.tokenOne}`
      },
      body: JSON.stringify({
        title: `Smoke Event ${now}`,
        description: 'smoke test event',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3600000).toISOString(),
        location: 'Online'
      })
    });

    if (!event._id) throw new Error('Event not created');
    state.eventId = event._id;
  });

  await runStep('Events - register for event', async () => {
    const reg = await requestJson(`/api/events/${state.eventId}/register`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.tokenTwo}`
      }
    });

    if (!reg.message) {
      throw new Error('No registration success message');
    }
  });

  await runStep('Messaging - send message (REST fallback)', async () => {
    const message = await requestJson('/api/messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.tokenOne}`
      },
      body: JSON.stringify({
        receiverId: state.userTwo._id,
        content: 'rest smoke message'
      })
    });

    if (!message._id) {
      throw new Error('Message not persisted');
    }
  });

  await runStep('Messaging - real-time update via socket', async () => {
    await testRealtimeMessage();
  });

  await maybeTestUpload();

  console.log('Smoke flow checks completed.');
}

main().catch(() => {
  process.exitCode = 1;
});
