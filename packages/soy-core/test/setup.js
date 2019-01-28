const ENSArtifact = require('soy-contracts/build/contracts/ENSRegistry.json');
const SoyPublicResolverArtifact = require('soy-contracts/build/contracts/SoyPublicResolver.json');
const contract = require('truffle-contract');
const Soy = require('../');

const ENS = contract(ENSArtifact);
const SoyPublicResolver = contract(SoyPublicResolverArtifact);

/**
 * Deploy a provider and ens contract and wire them together
 *
 * @param {Object} web3 - a web3 instance
 * @param {string} tld - the tld for the registry to manager
 * @param {Object} ipfs - IPFS endpoint configuration
 * @param {Object} txOps - default tx ops for web3
 * @returns {Promise<Soy>} - A soy instance
 */
async function setupEnsContracts(
  web3 = global.web3,
  tld = 'test',
  ipfs = global.ipfs,
  txOps = { from: global.accounts[0] }
) {
  const rootNode = web3.utils.asciiToHex(0);
  const provider = web3.currentProvider;

  ENS.setProvider(provider);
  ENS.defaults(txOps);
  SoyPublicResolver.setProvider(provider);
  SoyPublicResolver.defaults(txOps);

  const registryContract = await ENS.new(txOps);
  const resolverContract = await SoyPublicResolver.new(
    registryContract.address,
    txOps
  );

  await registryContract.setSubnodeOwner(
    rootNode,
    web3.utils.sha3(tld),
    txOps.from,
    txOps
  );

  return new Soy(provider, {
    ipfs,
    registryAddress: registryContract.address,
    resolverAddress: resolverContract.address,
    ...txOps
  });
}

/**
 * Register a new domain and publish a contentHash revision
 *
 * @param {Soy} soy - A soy instance
 * @param {string} domain - the domain to register
 * @param {string} contentHash - content hash to publish
 */
async function registerAndPublishRevision(soy, domain, contentHash) {
  const contract = await soy.registerDomain(domain);

  await contract.publishRevision(contentHash);
}

module.exports = {
  setupEnsContracts,
  registerAndPublishRevision
};
