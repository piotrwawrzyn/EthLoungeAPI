const fs = require('fs');
const cloudinary = require('cloudinary');

const getCloudinaryPublicKeyFromUrl = url => {
  const regex = /(https*:\/\/res.cloudinary.com\/dd0ogah1u\/image\/upload\/[^\/]*\/+)(.*)(\.png)/;

  const public_id = url.replace(regex, '$2');

  console.log('public_id: ' + public_id);
  return url
    .split('/')
    .pop()
    .split('.')[0];
};

const deleteImage = async path => {
  if (!path) return;

  if (process.env.NODE_ENV === 'production') {
    // Delete image from Cloudinary
    cloudinary.uploader.destroy(getCloudinaryPublicKeyFromUrl(path), function(
      result
    ) {
      console.log(result);
    });
  } else {
    // Delete image from local disk
    const relativePath = path.startsWith('/') ? path.slice(1) : path;
    const localPath = `${root}/public/${relativePath}`;

    await new Promise(resolve => {
      fs.unlink(localPath, err => {
        if (err) console.log('Failed to delete locally img from: ' + localPath);
        else
          console.log('Successfuly deleted image locally from: ' + localPath);

        resolve();
      });
    });
  }
};

module.exports = deleteImage;
