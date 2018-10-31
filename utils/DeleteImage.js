const fs = require('fs');

const DeleteImage = path => {
  path = `${root}/public/img/${path}`;

  fs.unlink(path, err => {
    if (err) console.log('Failed to delete img from: ' + path);
  });
};

module.exports = DeleteImage;
