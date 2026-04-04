const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const Group = require('./models/Group');
const User = require('./models/User');

function socketHandler(io) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.userId);
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Join personal room
    socket.join(socket.user._id.toString());

    // Join group rooms
    if (socket.user.groups) {
      socket.user.groups.forEach(gid => socket.join(gid.toString()));
    }

    // Send message
    socket.on('send_message', async (data) => {
      const { receiverId, content, group } = data;
      const msg = new Message({
        senderId: socket.user._id,
        receiverId,
        content,
        status: 'sent'
      });
      await msg.save();
      if (group) {
        io.to(receiverId).emit('receive_message', msg);
      } else {
        io.to(receiverId).emit('receive_message', msg);
        io.to(socket.user._id.toString()).emit('receive_message', msg);
      }
    });

    // Mark as read
    socket.on('read_message', async (msgId) => {
      await Message.findByIdAndUpdate(msgId, { status: 'read' });
    });

    // Join group
    socket.on('join_group', (groupId) => {
      socket.join(groupId);
    });

    // Leave group
    socket.on('leave_group', (groupId) => {
      socket.leave(groupId);
    });
  });
}

module.exports = socketHandler;
