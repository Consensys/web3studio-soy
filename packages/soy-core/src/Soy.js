const { SoyPublicResolver, ENS } = require('soy-contracts');
const Web3 = require('web3');
const namehash = require('eth-ens-namehash');
const Resolver = require('./Resolver');
const Ens = require('./Ens');

/**
 * Soy is the best interface for Soy's smart contracts. It provides an easily
 * scriptable interface for any deployment pattern.
 *
 * @property {ENS} ens - [ENS](#ens) resolver utility
 * @property {Web3} web3 - [web3.js](https://web3js.readthedocs.io/en/1.0/) instance
 */
class Soy {
  /**
   * Create a new soy instance
   *
   * @param {Object} options - Soy instance options
   * @param {Web3.Provider} options.provider - A Web3 provider instance
   * @param {string} [options.registryAddress] - An address for a deployed ENS registry
   * @param {string} [options.resolverAddress] - An address for a deploy SoyPublicResolver
   * @param {...Object} [options.txOps] - Default [transaction arguments](https://web3js.readthedocs.io/en/1.0/web3-eth.html#sendtransaction) passed to web3
   */
  constructor(options) {
    const { provider, registryAddress, resolverAddress, ...txOps } = options;

    // Tests have globally configured web3, can't break this
    // istanbul ignore next
    if (!provider) {
      throw new Error("Couldn't find a valid web3 provider.");
    }

    this._txOps = txOps;

    this.ens = new Ens(provider, registryAddress);
    this.web3 = new Web3(provider);

    ENS.setProvider(provider);
    ENS.defaults(this._txOps);

    SoyPublicResolver.setProvider(provider);
    SoyPublicResolver.defaults(this._txOps);

    if (resolverAddress) {
      this._resolverContract = SoyPublicResolver.at(resolverAddress);
    }
  }

  /**
   * Get the resolver contract
   *
   * @returns {Promise<SoyPublicResolver>} instance of soy public resolver
   * @private
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
   * With a registered domain, get a resolver instance for a specific node
   *
   * @example <caption>Publish a revision of your site</caption>
   * ```js
   * const resolver = await soy.resolver('example.madewith.eth');
   *
   * await resolver.publishRevision(
   *   '/ipfs/QmVyYoFQ8KDLMUWhzxTn24js9g5BiC6QX3ZswfQ56T7A5T'
   * );
   * ```
   *
   * @param {string} domain - The domain for the node
   * @returns {Promise<Resolver>} - A resolver instance
   */
  async resolver(domain) {
    const resolver = await this.ens.resolver(domain);

    return new Resolver(domain, resolver);
  }

  /**
   * Registers a new domain and sets it's resolver to Soy's PublicResolver
   * contract. This will only need to be done once per (sub)domain
   *
   * If you haven't done so yet, you will need to purchase a domain. We
   * recommend using [My Ether Wallet](https://www.myetherwallet.com/#ens).
   * Domain auctions will last a week.
   *
   * @example <caption>Register an ENS Domain with Soy</caption>
   * ```js
   * const resolver = await soy.registerDomain('example.madewith.eth');
   * ```
   *
   * @param {string} domain - a new ENS domain to register
   * @returns {Promise<Resolver>} a resolver instance
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
}

module.exports = Soy;
