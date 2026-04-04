const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Get messages between two users or in a group
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params; // userId or groupId
    const { type } = req.query; // 'user' or 'group'
    let messages;
    if (type === 'group') {
      messages = await Message.find({ receiverId: id }).sort({ createdAt: 1 });
    } else {
      messages = await Message.find({
        $or: [
          { senderId: req.user._id, receiverId: id },
          { senderId: id, receiverId: req.user._id }
        ]
      }).sort({ createdAt: 1 });
    }
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send message (non-socket fallback)
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const msg = new Message({ senderId: req.user._id, receiverId, content, status: 'sent' });
    await msg.save();
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
