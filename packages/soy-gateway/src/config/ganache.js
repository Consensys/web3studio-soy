// Provided by Ganache Test Environment
const { web3, testRegistryAddress } = global;

module.exports = () => ({
  provider: web3.currentProvider,
  ensTld: 'test',
  registryAddress: testRegistryAddress
});
