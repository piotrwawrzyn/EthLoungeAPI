const { contract, web3 } = require('../ethereum/vault');
const mongoose = require('mongoose');
const User = mongoose.model('user');
const refillUserBalance = require('../utils/refillUserBalance');

const listenToDepositEvents = async () => {
  contract.events.Deposit({}, (error, event) => {
    if (error) console.log('Error: ' + error);
    else {
      const username = event.returnValues.username;
      const weiAmount = event.returnValues.value;
      const ethAmount = web3.utils.fromWei(weiAmount, 'ether');

      User.findOne({ username: username }, (err, user) => {
        if (!user || err) throw new Error('No user found');
        refillUserBalance(user, 3, weiAmount, true);
      });
    }
  });
};

listenToDepositEvents();
