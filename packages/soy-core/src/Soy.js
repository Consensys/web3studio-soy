const { SoyPublicResolver, ENS } = require('soy-contracts');
const Web3 = require('web3');
const namehash = require('eth-ens-namehash');
const createNodeContract = require('./createNodeContract');
const Ens = require('./Ens');

/**
 * Top level interface to Soy contracts
 */
class Soy {
  /**
   * Create a new soy instance
   *
   * @param {Object} options - Soy instance options
   */
  constructor(options) {
    const { provider, registryAddress, resolverAddress, ...txOps } = options;

    this.web3 = provider ? new Web3(provider) : web3;
    this._txOps = txOps;

    // Tests have globally configured web3, can't break this
    // istanbul ignore next
    if (!this.web3) {
      throw new Error("Couldn't find a valid web3 provider.");
    }

    this._provider = this.web3.currentProvider;

    ENS.setProvider(this._provider);
    ENS.defaults(this._txOps);

    SoyPublicResolver.setProvider(this._provider);
    SoyPublicResolver.defaults(this._txOps);

    this.ens = new Ens(this._provider, registryAddress);

    if (resolverAddress) {
      this._resolverContract = SoyPublicResolver.at(resolverAddress);
    }
  }

  /**
   * Get the resolver contract
   *
   * @returns {Promise<SoyPublicResolver>} - instance of soy public resolver
   */
  async _getResolverContract() {
    // Can't easily fake a deployed test network
    // istanbul ignore next
    if (!this._resolverContract) {
      this._resolverContract = await SoyPublicResolver.deployed();
    }

    return this._resolverContract;
  }

  /**
   * Registers a new domain
   *
   * @param {string} domain - new domain to register
   * @returns {Promise<SoyPublicResolver>} - the registered domain
   */
  async registerDomain(domain) {
    const registry = await this.ens.registry();
    const resolver = await this._getResolverContract();

    const domainParts = domain.split('.');
    const label = domainParts[0];
    const nodeName = domainParts.slice(1).join('.');
    const newSubNode = namehash.hash(domain);

    await registry.setSubnodeOwner(
      namehash.hash(nodeName),
      web3.utils.sha3(label),
      this._txOps.from
    );

    await registry.setResolver(newSubNode, resolver.address);

    return this.resolver(domain);
  }

  /**
   * Get a resolver instance for a specific node
   *
   * @param {string} domain - The domain for the node
   * @returns {Promise<SoyPublicResolver>} - A resolver instance
   */
  async resolver(domain) {
    const resolver = await this.ens.resolver(domain);

    return createNodeContract(domain, resolver);
  }
}

module.exports = Soy;
