const axios = require('axios');
const fs = require('fs');
const deleteImage = require('./deleteImage');

const saveImage = async (image, path, filename) => {
  filename = filename.replace(/[/\\?%*:|"<>]/g, '-');

  const pathToDb = `${path}/${filename}.png`;

  await deleteImage(pathToDb);

  path = `${root}/public/img/${pathToDb}`;

  if (typeof image === 'string') {
    const response = await axios({ url: image, responseType: 'stream' });
    await response.data.pipe(fs.createWriteStream(path));
  } else {
    image.mv(path);
  }

  return pathToDb;
};

module.exports = saveImage;
