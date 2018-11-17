const Big = require('big.js');

const getScientificNotation = decimals => {
  const number = decimals - 1;

  return `10e+${number}`;
};

const tokenFromWei = (amount, decimals) =>
  Big(amount).div(getScientificNotation(decimals));

module.exports = tokenFromWei;
