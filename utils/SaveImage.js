const axios = require('axios');
const fs = require('fs');

const SaveImage = async (image, path) => {
  path = `${root}/public/img/${path}`;

  console.log(image, typeof image);

  try {
    if (typeof image === 'string') {
      const response = await axios({ url: image, responseType: 'stream' });
      await response.data.pipe(fs.createWriteStream(path));
    } else {
      image.mv(path);
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = SaveImage;
