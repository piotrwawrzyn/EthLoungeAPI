const _ = require('lodash');
const Big = require('big.js');
const tokenFromWei = require('../../utils/tokenFromWei');

const EstimateBetValue = (tokensBet, supportedTokens, pricesMap) => {
  let estimatedBetValue = Big(0);
  for (let i = 0; i < tokensBet.length; i++) {
    const token = _.find(supportedTokens, { _id: tokensBet[i].id });
    const { symbol, decimals } = token;
    const price = pricesMap.get(symbol).USD;

    const bigTokenAmount = tokenFromWei(tokensBet[i].amount, decimals);

    estimatedBetValue = estimatedBetValue.plus(bigTokenAmount.mul(price));
  }

  return estimatedBetValue.toFixed(3);
};

module.exports = EstimateBetValue;
