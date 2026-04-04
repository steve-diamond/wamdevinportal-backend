const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET /api/users/:id
router.get('/:id', protect, async (req, res) => {
	const user = await User.findById(req.params.id);
	res.json(user);
});

// PUT /api/users/:id
router.put('/:id', protect, async (req, res) => {
	const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
	res.json(user);
});

// DELETE /api/users/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
	await User.findByIdAndDelete(req.params.id);
	res.json({ message: 'User deleted' });
});

// GET /api/users/search
router.get('/', protect, async (req, res) => {
	const { name, institution, country, skills } = req.query;
	const query = {};
	if (name) query.fullName = { $regex: name, $options: 'i' };
	if (institution) query.institution = institution;
	if (country) query.country = country;
	if (skills) query.skills = { $in: skills.split(',') };
	const users = await User.find(query);
	res.json(users);
});

module.exports = router;
