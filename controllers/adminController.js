const User = require('../models/User');
const Event = require('../models/Event');
const Resource = require('../models/Resource');

// Analytics endpoints
exports.analytics = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const eventCount = await Event.countDocuments();
    const resourceCount = await Resource.countDocuments();
    const registrationCount = await Event.aggregate([
      { $project: { regCount: { $size: '$registrationList' } } },
      { $group: { _id: null, total: { $sum: '$regCount' } } }
    ]);
    res.json({
      users: userCount,
      events: eventCount,
      resources: resourceCount,
      registrations: registrationCount[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User CRUD
exports.listUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};
exports.updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(user);
};
exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
};

// Event CRUD
exports.listEvents = async (req, res) => {
  const events = await Event.find();
  res.json(events);
};
exports.updateEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(event);
};
exports.deleteEvent = async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ message: 'Event deleted' });
};

// Resource CRUD
exports.listResources = async (req, res) => {
  const resources = await Resource.find();
  res.json(resources);
};
exports.updateResource = async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(resource);
};
exports.deleteResource = async (req, res) => {
  await Resource.findByIdAndDelete(req.params.id);
  res.json({ message: 'Resource deleted' });
};
