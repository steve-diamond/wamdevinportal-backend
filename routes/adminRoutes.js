const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const User = require('../models/User');
const Event = require('../models/Event');
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/stats', protect, adminOnly, async (req, res) => {
	const totalUsers = await User.countDocuments();
	const totalEvents = await Event.countDocuments();
	const totalResources = await Resource.countDocuments();

	res.json({
		totalUsers,
		totalEvents,
		totalResources
	});
});

// Analytics
router.get('/analytics', auth, role('admin'), adminController.analytics);

// User management
router.get('/users', auth, role('admin'), adminController.listUsers);
router.put('/users/:id', auth, role('admin'), adminController.updateUser);
router.delete('/users/:id', auth, role('admin'), adminController.deleteUser);

// Event management
router.get('/events', auth, role('admin'), adminController.listEvents);
router.put('/events/:id', auth, role('admin'), adminController.updateEvent);
router.delete('/events/:id', auth, role('admin'), adminController.deleteEvent);

// Resource management
router.get('/resources', auth, role('admin'), adminController.listResources);
router.put('/resources/:id', auth, role('admin'), adminController.updateResource);
router.delete('/resources/:id', auth, role('admin'), adminController.deleteResource);

module.exports = router;
