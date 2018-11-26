const axios = require('axios');
const fs = require('fs');
const cloudinary = require('cloudinary');

const saveImage = async (image, path, filename) => {
  filename = filename.replace(/[/\\?%*:|"<>]/g, '-');
  filename = filename.replace(' ', '-');

  const relativePath = `${path}/${filename}`;

  if (process.env.NODE_ENV === 'production') {
    // Save image to Cloudinary
    const image_data = await new Promise(resolve =>
      cloudinary.uploader
        .upload_stream(result => resolve(result), {
          public_id: relativePath,
          format: 'png'
        })
        .end(image.data)
    );

    return image_data.secure_url;
  } else {
    // Save image to local disk

    const localPath = `${root}/public/${relativePath}.png`;

    if (typeof image === 'string') {
      const response = await axios({ url: image, responseType: 'stream' });
      await new Promise(resolve =>
        response.data
          .pipe(fs.createWriteStream(localPath))
          .on('finish', resolve)
      );
    } else {
      await image.mv(localPath, err => {
        if (err) console.log(err);
        else console.log('Successfuly saved file to ' + localPath);
      });
    }

    return '/' + relativePath + '.png';
  }
};

module.exports = saveImage;
