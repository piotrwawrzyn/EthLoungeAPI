const _ = require('lodash');
const Big = require('big.js');
const TokenFromWei = require('../TokenFromWei');

const EstimateBetValue = (tokensBet, supportedTokens, pricesMap) => {
  console.log(pricesMap);
  let estimatedBetValue = Big(0);
  for (let i = 0; i < tokensBet.length; i++) {
    const token = _.find(supportedTokens, { _id: tokensBet[i].id });
    const { symbol, decimals } = token;
    const price = pricesMap.get(symbol).USD;

    const bigTokenAmount = TokenFromWei(tokensBet[i].amount, decimals);

    estimatedBetValue = estimatedBetValue.plus(bigTokenAmount.mul(price));
  }

  return estimatedBetValue.toFixed(3);
};

module.exports = EstimateBetValue;
