const { SoyPublicResolver, ENS } = require('soy-contracts');
const Web3 = require('web3');
const namehash = require('eth-ens-namehash');
const createNodeContract = require('./createNodeContract');
const Ens = require('./Ens');

const { web3 } = global || window;

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

    if (!this.web3) {
      throw new Error("Couldn't find a valid web3 provider.");
    }

    this._provider = provider || web3.currentProvider;

    ENS.setProvider(this._provider);
    ENS.defaults(this._txOps);

    SoyPublicResolver.setProvider(this._provider);
    SoyPublicResolver.defaults(this._txOps);

    this.ens = new Ens(this._provider, registryAddress);

    if (registryAddress) {
      this._registryContract = ENS.at(registryAddress);
    }

    if (resolverAddress) {
      this._resolverContract = SoyPublicResolver.at(resolverAddress);
    }
  }

  /**
   * Get the registry contract
   *
   * @returns {Promise<ENS>} - instance of ens registry contract
   */
  async registryContract() {
    if (!this._registryContract) {
      this._registryContract = ENS.deployed();
    }

    return this._registryContract;
  }

  /**
   * Get the resolver contract
   *
   * @returns {Promise<SoyPublicResolver>} - instance of soy public resolver
   */
  async resolverContract() {
    if (!this._resolverContract) {
      this._resolverContract = await SoyPublicResolver.deployed();
    }

    return this._resolverContract;
  }

  /**
   * Registers a new domain
   *
   * @param {string} domain - new domain to register
   * @returns {Promise<string>} - the registered domain
   */
  async registerDomain(domain) {
    const registry = await this.registryContract();
    const resolver = await this.resolverContract();

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

    return this.getNodeResolver(domain);
  }

  /**
   * Get a resolver instance for a specific node
   *
   * @param {string} domain - The domain for the node
   * @returns {Promise<SoyPublicResolver>} - A resolver instance
   */
  async getNodeResolver(domain) {
    const node = namehash.hash(domain);
    const resolver = await this.ens.resolveContract(domain);

    return createNodeContract(node, resolver.address);
  }
}

module.exports = Soy;
