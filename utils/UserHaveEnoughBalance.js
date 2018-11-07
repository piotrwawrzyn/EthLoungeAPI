const _ = require('lodash');
const Big = require('big.js');

const UserHaveEnoughBalance = (user, tokens) => {
  if (!user) return false;
  if (tokens.length === 0) return false;

  const { balances } = user;
  for (token of tokens) {
    const { id, amount } = token;
    const balanceToken = _.find(balances, { id });
    if (!balanceToken) return false;
    if (Big(balanceToken.balance).cmp(Big(amount)) === -1) return false;
  }

  return true;
};

module.exports = UserHaveEnoughBalance;
