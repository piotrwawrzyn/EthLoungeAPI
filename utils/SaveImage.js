const axios = require('axios');
const fs = require('fs');
const DeleteImage = require('./DeleteImage');

const SaveImage = async (image, path) => {
  DeleteImage(path);
  path = `${root}/public/img/${path}.png`;

  if (typeof image === 'string') {
    const response = await axios({ url: image, responseType: 'stream' });
    await response.data.pipe(fs.createWriteStream(path));
  } else {
    image.mv(path);
  }
};

module.exports = SaveImage;
