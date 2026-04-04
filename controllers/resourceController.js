const Resource = require('../models/Resource');
const s3 = require('../config/s3');
const { v4: uuidv4 } = require('uuid');
const AWS_BUCKET = process.env.AWS_S3_BUCKET;

// Upload resource (alumni/faculty/admin only)
exports.uploadResource = async (req, res) => {
  if (!['alumni', 'faculty', 'admin'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const fileKey = `${uuidv4()}_${req.file.originalname}`;
  try {
    await s3.upload({
      Bucket: AWS_BUCKET,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }).promise();
    const resource = new Resource({
      title: req.body.title,
      description: req.body.description,
      fileUrl: fileKey,
      uploadedBy: req.user._id,
      category: req.body.category
    });
    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Download resource (secure signed URL)
exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    const url = s3.getSignedUrl('getObject', {
      Bucket: AWS_BUCKET,
      Key: resource.fileUrl,
      Expires: 60 * 5 // 5 minutes
    });
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List resources with filter
exports.listResources = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const resources = await Resource.find(filter).populate('uploadedBy', 'fullName email');
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
