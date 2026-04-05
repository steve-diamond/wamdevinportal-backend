const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect } = require('../middleware/authMiddleware');

// Create Event
router.post('/', protect, async (req, res) => {
	const event = await Event.create(req.body);
	res.json(event);
});

// Get All Events
router.get('/', protect, async (req, res) => {
	const events = await Event.find();
	res.json(events);
});

// Register for Event
router.post('/:id/register', protect, async (req, res) => {
	const event = await Event.findById(req.params.id);
	event.registrationList.push(req.user._id);
	await event.save();
	res.json({ message: 'Registered successfully' });
});

module.exports = router;
