const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const bucket = process.env.AWS_S3_BUCKET || process.env.AWS_BUCKET_NAME;

let storage;
if (bucket) {
  storage = multerS3({
    s3,
    bucket,
    acl: 'private',
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  });
} else {
  console.warn('S3 bucket env not configured. /api/resources/upload will be unavailable.');
  storage = multer.memoryStorage();
}

const upload = multer({ storage });

module.exports = upload;
