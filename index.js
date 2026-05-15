require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const eventRoutes = require('./routes/eventRoutes');
const messageRoutes = require('./routes/messageRoutes');
const groupRoutes = require('./routes/groupRoutes');
const socketHandler = require('./socket');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:3000',
  'https://wamdevin.com',
  'https://www.wamdevin.com'
];

const corsOrigins = allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins;

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  return corsOrigins.includes(origin);
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error('Not allowed by Socket.IO CORS'));
    }
  }
});

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('WAMDIN Alumni API is running...');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);

app.use(errorHandler);
socketHandler(io);

// Start HTTP server immediately so Render detects the open port
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB with retry logic
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('FATAL: MONGO_URI environment variable is not set. Set it in Render → Environment.');
  process.exit(1);
}

const connectWithRetry = (attempt = 1, maxAttempts = 5) => {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
      console.error(`MongoDB connection error (attempt ${attempt}):`, err.message);
      if (attempt < maxAttempts) {
        const delay = Math.min(1000 * 2 ** attempt, 30000);
        console.log(`Retrying in ${delay / 1000}s...`);
        setTimeout(() => connectWithRetry(attempt + 1, maxAttempts), delay);
      } else {
        console.error('Max connection attempts reached. Exiting.');
        process.exit(1);
      }
    });
};

connectWithRetry();
