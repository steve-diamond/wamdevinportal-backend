const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Example of a protected route
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
