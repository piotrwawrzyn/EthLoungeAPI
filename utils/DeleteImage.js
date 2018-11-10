const fs = require('fs');

const DeleteImage = async path => {
  path = `${root}/public/img/${path}`;

  await new Promise((resolve, reject) => {
    fs.unlink(path, err => {
      if (err) console.log('Failed to delete img from: ' + path);
      else console.log('Successfuly deleted image from: ' + path);

      resolve();
    });
  });
};

module.exports = DeleteImage;
