// Admin routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);
// Resource routes
const resourceRoutes = require('./routes/resourceRoutes');
app.use('/api/resources', resourceRoutes);
// Event routes
const eventRoutes = require('./routes/eventRoutes');
app.use('/api/events', eventRoutes);
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());



// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


// User profile routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Messaging routes
const messageRoutes = require('./routes/messageRoutes');
app.use('/api/messages', messageRoutes);

// Group routes
const groupRoutes = require('./routes/groupRoutes');
app.use('/api/groups', groupRoutes);


const http = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./socket');

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
socketHandler(io);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));
