const _ = require('lodash');
const Big = require('big.js');

const refillUserBalance = async (user, tokenId, tokenAmount, save) => {
  const { balances } = user;

  const balanceToken = _.find(balances, { id: tokenId });

  balanceToken.balance = Big(balanceToken.balance).plus(Big(tokenAmount));

  if (save) await user.save();
};

module.exports = refillUserBalance;
