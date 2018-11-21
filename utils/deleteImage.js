const fs = require('fs');
const s3Client = require('../services/s3Client');
const AmazonS3URI = require('amazon-s3-uri');

const deleteImage = async path => {
  if (process.env.NODE_ENV === 'production') {
    // Delete from S3 bucket

    const { key } = AmazonS3URI(path);

    const params = {
      Bucket: process.env.S3_BUCKET,
      Delete: {
        Objects: [
          {
            Key: key
          }
        ]
      }
    };

    const deleteImage = s3Client.deleteObjects(params);

    deleteImage.on('error', err =>
      console.error('Unable to delete. Error: ', err.stack)
    );
  } else {
    // Delete locally
    path = `${root}/public/${path}`;

    await new Promise((resolve, reject) => {
      fs.unlink(path, err => {
        if (err) console.log('Failed to delete img from: ' + path);
        else console.log('Successfuly deleted image from: ' + path);

        resolve();
      });
    });
  }
};

module.exports = deleteImage;
