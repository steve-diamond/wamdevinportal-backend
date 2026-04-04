const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer();

router.post('/', auth, upload.single('file'), resourceController.uploadResource);
router.get('/', resourceController.listResources);
router.get('/:id/download', auth, resourceController.downloadResource);

module.exports = router;
