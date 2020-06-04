const mongoose = require('mongoose');
const Token = mongoose.model('token');
const PricesMap = require('../utils/pricesMap');

const updatePrices = async () => {
  console.log('Updating crypto prices...');
  const supportedTokens = await Token.find({}).exec();
  const pricesMap = await PricesMap(supportedTokens);

  for (token of supportedTokens) {
    token.price.USD = pricesMap.get(token.symbol).USD;
    token.price.ETH = pricesMap.get(token.symbol).ETH;
    await token.save();
  }

  setTimeout(updatePrices, 1000 * 60 * 5);
};

updatePrices();
