const axios = require('axios');
const fs = require('fs');
const s3Client = require('../services/s3Client');

const saveImage = async (image, path, filename) => {
  filename = filename.replace(/[/\\?%*:|"<>]/g, '-');
  filename = filename.replace(' ', '-');

  // Image will be save to something like C:\EthLoungeAPI/public/img.../filename.png and to an S3 bucket under this path

  const relativePath = `${path}/${filename}.png`;

  const localPath = `${root}/public/${relativePath}`;

  if (typeof image === 'string') {
    const response = await axios({ url: image, responseType: 'stream' });
    await new Promise(resolve =>
      response.data.pipe(fs.createWriteStream(localPath)).on('finish', resolve)
    );
  } else {
    await image.mv(localPath, err => {
      if (err) console.log(err);
      else console.log('Successfuly saved file to ' + localPath);
    });
  }

  if (process.env.NODE_ENV === 'production') {
    // Save file to s3;

    const params = {
      localFile: localPath,

      s3Params: {
        Bucket: process.env.S3_BUCKET,
        Key: relativePath
      }
    };

    await new Promise(resolve => {
      const uploader = s3Client.uploadFile(params);

      uploader.on('error', err => {
        console.error('Unable to upload. Error: ', err.stack);
        resolve();
      });

      uploader.on('end', () => {
        console.log('Done uploading ' + relativePath);
        resolve();
      });
    });
  }

  return '/' + relativePath;
};

module.exports = saveImage;
