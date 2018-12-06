const namehash = require('eth-ens-namehash');

const ENSRegistry = artifacts.require(
  '@ensdomains/ens/contracts/ENSRegistry.sol'
);
const ReverseRegistrar = artifacts.require(
  '@ensdomains/ens/contracts/ReverseRegistrar.sol'
);
const PublicResolver = artifacts.require('SoyPublicResolver.sol');

module.exports = async deployer => {
  const accounts = await web3.eth.getAccounts();
  const owner = accounts[0];
  const deployOps = { from: owner };
  const rootNode = web3.utils.asciiToHex(0);

  // Only setup ENS resolvers on development network
  if (deployer.network !== 'development') {
    return;
  }

  await deployer.deploy(ENSRegistry);
  await deployer.deploy(PublicResolver, ENSRegistry.address);

  await deployer.deploy(
    ReverseRegistrar,
    ENSRegistry.address,
    PublicResolver.address
  );

  const registry = await ENSRegistry.at(ENSRegistry.address);

  // eth tld
  await registry.setSubnodeOwner(
    rootNode,
    web3.utils.sha3('eth'),
    owner,
    deployOps
  );

  // reverse
  await registry.setSubnodeOwner(
    rootNode,
    web3.utils.sha3('reverse'),
    owner,
    deployOps
  );

  // addr.reverse
  await registry.setSubnodeOwner(
    namehash.hash('reverse'),
    web3.utils.sha3('addr'),
    ReverseRegistrar.address,
    deployOps
  );
};
