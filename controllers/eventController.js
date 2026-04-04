const Event = require('../models/Event');
const User = require('../models/User');

// Create event (admin/faculty only)
exports.createEvent = async (req, res) => {
  if (!['admin', 'faculty'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  try {
    const event = new Event({ ...req.body, createdBy: req.user._id });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'fullName email');
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get event by ID
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'fullName email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update event (admin/faculty only)
exports.updateEvent = async (req, res) => {
  if (!['admin', 'faculty'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete event (admin/faculty only)
exports.deleteEvent = async (req, res) => {
  if (!['admin', 'faculty'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register for event
exports.registerEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { registrationList: req.user._id } },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Registration successful', event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
