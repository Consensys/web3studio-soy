const { ENS } = require('../');

const ENSRegistry = artifacts.require('ENSRegistry.sol');
const SoyPublicResolver = artifacts.require('SoyPublicResolver.sol');

module.exports = async deployer => {
  const networkId = await web3.eth.net.getId();

  let ensAddress = ENS.networks[networkId] && ENS.networks[networkId].address;

  if (!ensAddress) {
    await deployer.deploy(ENSRegistry);
    ensAddress = ENSRegistry.address;
  }

  await deployer.deploy(SoyPublicResolver, ensAddress);
};
