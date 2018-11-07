const _ = require('lodash');
const RemoveEmptyBalances = async (user, save = false) => {
  _.remove(user.balances, function(item) {
    const isEmpty = item.balance == 0;
    return item.balance == 0;
  });

  user.markModified('balances');
  if (save) await user.save();
};

module.exports = RemoveEmptyBalances;
