const mongoose = require('mongoose');
const Token = mongoose.model('token');
const fs = require('fs');
const signedIn = require('../middleware/signedIn');
const DeleteImage = require('../../utils/DeleteImage');

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
        logo.mv(`${root}/public/img/tokens/${new_token.symbol}.png`);
      }

      res.send({ token: new_token });
    });
  });

  server.post('/backend/update_token', (req, res) => {
    let logo = req.files ? req.files.logo : '';
    const { displayName, symbol, id, decimals } = req.body;

    Token.findById({ _id: id }, async (err, token) => {
      if (err) res.send(err);
      if (logo) logo.mv(`${root}/public/img/tokens/${id}.png`);
      token.displayName = displayName;
      token.symbol = symbol;
      token.decimals = decimals;
      token.save();

      res.send();
    });
  });

  server.post('/backend/delete_token', (req, res) => {
    const { id } = req.body;
    Token.deleteOne({ _id: id }).exec();
    DeleteImage(`tokens/${id}.png`);

    res.send();
  });
};
