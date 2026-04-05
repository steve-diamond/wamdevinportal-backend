const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const userSafeFields = '-passwordHash -verificationToken -resetPasswordToken -resetPasswordExpires';

const buildSearchFilter = (query) => {
	const { name, institution, country, skills, graduationYear } = query;
	const filter = {};
	if (name) filter.fullName = { $regex: name, $options: 'i' };
	if (institution) filter.institution = institution;
	if (country) filter.country = country;
	if (skills) filter.skills = { $in: String(skills).split(',') };
	if (graduationYear) filter.graduationYear = Number(graduationYear);
	return filter;
};

const searchUsers = async (req, res) => {
	try {
		const page = Math.max(parseInt(req.query.page || '1', 10), 1);
		const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
		const skip = (page - 1) * limit;

		const filter = buildSearchFilter(req.query);
		const [users, total] = await Promise.all([
			User.find(filter).select(userSafeFields).skip(skip).limit(limit),
			User.countDocuments(filter)
		]);

		res.json({
			users,
			total,
			page,
			pages: Math.ceil(total / limit) || 1
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// GET /api/users/search
router.get('/search', protect, searchUsers);

// GET /api/users
router.get('/', protect, searchUsers);

// GET /api/users/:id
router.get('/:id', protect, async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select(userSafeFields);
		if (!user) return res.status(404).json({ message: 'User not found' });
		res.json(user);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// PUT /api/users/:id
router.put('/:id', protect, async (req, res) => {
	try {
		const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select(userSafeFields);
		if (!user) return res.status(404).json({ message: 'User not found' });
		res.json(user);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// DELETE /api/users/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
	try {
		const deleted = await User.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ message: 'User not found' });
		res.json({ message: 'User deleted' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

module.exports = router;
