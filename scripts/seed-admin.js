require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wamdin_alumni_portal';

async function seedAdmin() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI);

  const db = mongoose.connection.db;
  const users = db.collection('users');

  // Check existing
  const existing = await users.findOne({ email: 'admin@wamdevin.com' });
  if (existing) {
    console.log('Admin user found:', existing._id.toString());
    console.log('  role:', existing.role);
    console.log('  isVerified:', existing.isVerified);
    console.log('  passwordHash present:', !!existing.passwordHash);

    // Re-hash and update password to be sure
    const hash = await bcrypt.hash('Wamdin2026', 12);
    await users.updateOne(
      { email: 'admin@wamdevin.com' },
      { $set: { passwordHash: hash, role: 'admin', isVerified: true, fullName: 'Admin User' } }
    );
    console.log('Admin user password reset to: Wamdin2026');
  } else {
    const hash = await bcrypt.hash('Wamdin2026', 12);
    const result = await users.insertOne({
      fullName: 'Admin User',
      email: 'admin@wamdevin.com',
      passwordHash: hash,
      role: 'admin',
      isVerified: true,
      skills: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Admin user created with _id:', result.insertedId.toString());
    console.log('  email: admin@wamdevin.com');
    console.log('  password: Wamdin2026');
  }

  // Verify bcrypt
  const user = await users.findOne({ email: 'admin@wamdevin.com' });
  const ok = await bcrypt.compare('Wamdin2026', user.passwordHash);
  console.log('bcrypt.compare("Wamdin2026", hash):', ok ? 'PASS ✓' : 'FAIL ✗');

  await mongoose.disconnect();
  console.log('Done.');
}

seedAdmin().catch(err => { console.error(err); process.exit(1); });
