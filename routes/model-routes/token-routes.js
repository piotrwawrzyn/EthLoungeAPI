const mongoose = require('mongoose');
const Token = mongoose.model('token');
const deleteImage = require('../../utils/deleteImage');
const saveImage = require('../../utils/saveImage');
const IMAGE_FOLDER_PATH = 'tokens';

module.exports = server => {
  server.get('/api/tokens', async (req, res) => {
    const tokens = await Token.find({});
    res.send(tokens);
  });

  server.post('/backend/new_token', (req, res) => {
    let logo = req.files.logo;
    const { displayName, symbol, address, decimals } = req.body;

    let new_token;

    Token.findOne({ address: address }, async (err, token) => {
      if (!token) {
        new_token = await new Token({
          displayName,
          symbol,
          address,
          decimals
        }).save();
        const { _id } = new_token;
        const logo = await saveImage(
          logo,
          IMAGE_FOLDER_PATH,
          `${_id}_${displayName}`
        );
      }

      res.send({ token: new_token });
    });
  });

  server.post('/backend/update_token', (req, res) => {
    let logo = req.files ? req.files.logo : '';
    const { displayName, symbol, id, decimals } = req.body;

    Token.findById({ _id: id }, async (err, token) => {
      if (err) res.send(err);
      token.displayName = displayName ? displayName : token.displayName;
      token.symbol = symbol ? symbol : token.symbol;
      token.decimals = decimals ? decimals : token.decimals;

      if (logo) {
        await deleteImage(token.logo);
        token.logo = await saveImage(
          logo,
          IMAGE_FOLDER_PATH,
          `${id}_${token.displayName}`
        );
      }

      token.save();

      res.send();
    });
  });

  server.post('/backend/delete_token', (req, res) => {
    const { id } = req.body;
    Token.findByIdAndDelete(id, async (err, token) => {
      const { logo } = token;
      await deleteImage(logo);
    });

    res.send();
  });
};
