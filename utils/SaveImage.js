const axios = require('axios');
const fs = require('fs');
const DeleteImage = require('./DeleteImage');

const SaveImage = async (image, path, filename) => {
  filename = filename.replace(/[/\\?%*:|"<>]/g, '-');

  const pathToDb = `${path}/${filename}.png`;

  await DeleteImage(pathToDb);

  path = `${root}/public/img/${pathToDb}`;

  if (typeof image === 'string') {
    const response = await axios({ url: image, responseType: 'stream' });
    await response.data.pipe(fs.createWriteStream(path));
  } else {
    image.mv(path);
  }

  return pathToDb;
};

module.exports = SaveImage;
