const { SoyPublicResolver, ENS } = require('soy-contracts');
const namehash = require('eth-ens-namehash');

const { web3, accounts } = global;

/**
 * Provides handy library for setting up a test ENS registry and registering
 * domains
 */
class EnsSetup {
  /**
   * Create a new EnsSetup
   *
   * @param {string} tld - top level domain for the registry
   */
  constructor(tld) {
    this._owner = accounts[0];
    this._fromOwner = { from: this._owner, gas: 6721975 };
    this._tld = tld;

    ENS.setProvider(web3.currentProvider);
    SoyPublicResolver.setProvider(web3.currentProvider);
  }

  /**
   * Creates an ENS registry
   *
   * @returns {Promise<string>} - The created registry's address
   */
  async createRegistry() {
    const rootNode = web3.utils.asciiToHex(0);

    this._registry = await ENS.new(this._fromOwner);
    this._resolver = await SoyPublicResolver.new(
      this._registry.address,
      this._fromOwner
    );

    await this._registry.setSubnodeOwner(
      rootNode,
      web3.utils.sha3(this._tld),
      this._owner,
      this._fromOwner
    );

    return this._registry.address;
  }

  /**
   * Registers a new domain
   *
   * @param {string} label - new domain label to register
   * @param {string} contentHash - Content hash to associate with the domain
   * @returns {Promise<string>} - the registered domain
   */
  async register(label, contentHash) {
    const domain = `${label}.${this._tld}`;
    const node = namehash.hash(domain);

    await this._registry.setSubnodeOwner(
      namehash.hash(this._tld),
      web3.utils.sha3(label),
      this._owner,
      this._fromOwner
    );

    await this._registry.setResolver(
      node,
      this._resolver.address,
      this._fromOwner
    );

    await this._resolver.publishRevision(
      node,
      web3.utils.asciiToHex(contentHash),
      this._fromOwner
    );

    return domain;
  }
}

module.exports = EnsSetup;
