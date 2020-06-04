const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const dev = require('../config/dev');

const provider = new HDWalletProvider(
  dev.mnemonic,
  'https://rinkeby.infura.io/v3/20d196d712e0489981ab9ab873568b0a'
);

const web3 = new Web3(provider);

module.exports = { web3, provider };
