const fs = require('fs');
const s3Client = require('../services/s3Client');

const deleteImage = async path => {
  if (!path) return;

  const relativePath = path.startsWith('/') ? path.slice(1) : path;

  if (process.env.NODE_ENV === 'production') {
    // Delete from S3 bucket

    const params = {
      Bucket: process.env.S3_BUCKET,
      Delete: {
        Objects: [
          {
            Key: relativePath
          }
        ]
      }
    };

    const deleteImage = s3Client.deleteObjects(params);

    deleteImage.on('error', err =>
      console.error('Unable to delete. Error: ', err.stack)
    );
  }

  // Delete locally
  const localPath = `${root}/public/${relativePath}`;

  await new Promise((resolve, reject) => {
    fs.unlink(localPath, err => {
      if (err) console.log('Failed to delete img from: ' + localPath);
      else console.log('Successfuly deleted image from: ' + localPath);

      resolve();
    });
  });
};

module.exports = deleteImage;
