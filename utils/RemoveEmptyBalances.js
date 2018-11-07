const _ = require('lodash');
const RemoveEmptyBalances = async user => {
  _.remove(user.balances, function(item) {
    const isEmpty = item.balance == 0;
    console.log(isEmpty);
    return item.balance == 0;
  });

  user.markModified('balances');
};

module.exports = RemoveEmptyBalances;
