const axios = require('axios');
const mongoose = require('mongoose');
const Token = mongoose.model('token');

const PricesMap = async tokens => {
  if (!tokens) tokens = await Token.find({});
  const symbols = tokens.map(curr => curr.symbol);
  const response = await axios(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols.map(
      curr => curr + ','
    )},&tsyms=USD,ETH`
  );

  const data = response.data;
  const pricesMap = new Map(Object.entries(data));

  return pricesMap;
};

module.exports = PricesMap;
