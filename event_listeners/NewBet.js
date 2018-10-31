const EthLounge = require('../ethereum/EthLounge');
const Web3 = require('web3');
const web3 = require('../ethereum/web3');

EthLounge.events
  .NewBet({
    fromBlock: 0,
    function(error, event) {
      console.log('callback', event);
    }
  })
  .on('data', event => {
    const { transactionHash } = event;
  });
