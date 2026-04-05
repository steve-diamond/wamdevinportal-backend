const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/fileUploader');
const localUpload = multer();

router.post('/upload', protect, upload.single('file'), async (req, res) => {
	const resource = await Resource.create({
		title: req.body.title,
		description: req.body.description,
		fileUrl: req.file.location,
		uploadedBy: req.user._id,
		category: req.body.category
	});

	res.json(resource);
});

router.post('/', auth, localUpload.single('file'), resourceController.uploadResource);
router.get('/', resourceController.listResources);
router.get('/:id/download', auth, resourceController.downloadResource);

module.exports = router;
