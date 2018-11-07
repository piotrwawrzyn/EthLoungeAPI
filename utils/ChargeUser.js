const _ = require('lodash');
const Big = require('big.js');
const RemoveEmptyBalances = require('./RemoveEmptyBalances');

const ChargeUser = async (user, tokens, save) => {
  const { balances } = user;
  for (token of tokens) {
    const { id, amount } = token;
    const balanceToken = _.find(balances, { id });

    balanceToken.balance = Big(balanceToken.balance).minus(Big(amount));
  }

  if (save) await user.save();
};

module.exports = ChargeUser;
