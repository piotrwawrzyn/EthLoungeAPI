const mongoose = require('mongoose');
const { Schema } = mongoose;
const { plugin } = require('mongoose-auto-increment');

const tokenSchema = new Schema({
  displayName: String,
  symbol: String,
  address: String,
  decimals: Number,
  logo: String,
  price: {
    USD: String
  }
});

tokenSchema.plugin(plugin, 'token');
const Token = mongoose.model('token', tokenSchema);

const addInitialSupportedToken = (displayName, symbol, address, decimals) => {
  Token.findOne({ address }, async (err, token) => {
    if (!token) {
      const initial_token = new Token({
        displayName,
        symbol,
        address,
        decimals
      });

      initial_token.save();
    }
  });
};

addInitialSupportedToken(
  'Ethereum',
  'ETH',
  '0x0000000000000000000000000000000000000000',
  18
);
addInitialSupportedToken(
  'Power Ledger',
  'POWR',
  '0x8f0C267ef144D319CcF1d724c222a59A50CD7B43',
  6
);
addInitialSupportedToken(
  'Metal',
  'MTL',
  '0x7f0C267ef144D319CcF1d724c222a59A50CD7B43',
  8
);
addInitialSupportedToken(
  'Basic Attention Token',
  'BAT',
  '0x9f0C267ef144D319CcF1d724c222a59A50CD7B43',
  18
);
