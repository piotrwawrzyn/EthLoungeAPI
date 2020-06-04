const compiledContract = require('./build/Vault.json');
const { web3, provider } = require('./web3');

(async () => {
  const accounts = await web3.eth.getAccounts();

  console.log(`Attempting to deploy from account: ${accounts[0]}`);

  const deployedContract = await new web3.eth.Contract(compiledContract.abi)
    .deploy({
      data: '0x' + compiledContract.evm.bytecode.object
    })
    .send({
      from: accounts[0],
      gas: '2000000'
    });

  provider.engine.stop();
})();
