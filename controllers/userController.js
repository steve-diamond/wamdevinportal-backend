const User = require('../models/User');

// Get user profile by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -verificationToken -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user profile
exports.updateUser = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const updates = { ...req.body };
    delete updates.passwordHash;
    delete updates.email;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-passwordHash -verificationToken -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search users with filters and pagination
exports.searchUsers = async (req, res) => {
  try {
    const { name, skills, country, institution, graduationYear, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (name) filter.fullName = { $regex: name, $options: 'i' };
    if (skills) filter.skills = { $in: skills.split(',') };
    if (country) filter.country = country;
    if (institution) filter.institution = institution;
    if (graduationYear) filter.graduationYear = Number(graduationYear);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter)
      .select('-passwordHash -verificationToken -resetPasswordToken -resetPasswordExpires')
      .skip(skip)
      .limit(parseInt(limit));
    const total = await User.countDocuments(filter);
    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
