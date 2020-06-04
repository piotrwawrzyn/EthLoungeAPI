const Web3 = require('web3');

const provider = new Web3.providers.WebsocketProvider(
  'wss://rinkeby.infura.io/ws/v3/20d196d712e0489981ab9ab873568b0a'
);

const web3 = new Web3(provider);

const address = '0x7F1543DB70701D98Eba1bF80DCF42968119fdebd';

const abi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'username',
        type: 'string'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256'
      }
    ],
    name: 'Deposit',
    type: 'event'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'username',
        type: 'string'
      }
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      }
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

module.exports = { contract: new web3.eth.Contract(abi, address), web3 };
