const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phone: String,
  institution: String,
  graduationYear: Number,
  currentPosition: String,
  skills: [String],
  country: String,
  bio: String,
  profilePicture: String,
  role: { type: String, enum: ['alumni', 'faculty', 'admin', 'partner'], default: 'alumni' },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
