const s3Client = require('../services/s3Client');

const syncDirectory = (localDir, remoteDir) => {
  const params = {
    localDir: localDir,
    s3Params: {
      Bucket: process.env.S3_BUCKET,
      Prefix: remoteDir
    }
  };

  const uploader = s3Client.downloadDir(params);

  uploader.on('error', err => {
    console.error('Unable to sync. Error: ', err.stack);
  });

  uploader.on('end', () => {
    console.log('Done syncing.');
  });
};

module.exports = syncDirectory;
