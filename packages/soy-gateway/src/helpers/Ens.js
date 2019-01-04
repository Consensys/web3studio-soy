const Web3 = require('web3');
const Cache = require('lru-cache');
const namehash = require('eth-ens-namehash');
const { SoyPublicResolver, ENS } = require('soy-contracts');

/**
 * An ENS resolver. It aims to resolve various fields in a record and cache the
 * results respecting it's set ttl
 */
class EnsResolver {
  /**
   * Constructor
   *
   * @param {Object} provider - Optional web3@1 provider, defaults to localhost
   * @param {string} registryAddress - An optional registry address for bespoke networks
   */
  constructor(provider, registryAddress) {
    this._cache = new Cache();
    this._defaultTTL = 10; //seconds

    SoyPublicResolver.setProvider(provider);
    ENS.setProvider(provider);

    this._registryAddress = registryAddress;
    this._ensContract = null;
  }

  /**
   * Creates or returns an ENS registry contract
   *
   * @returns {Promise<Contract>} - A promise for a registry contract
   * @private
   */
  async _getEnsContract() {
    if (!this._ensContract) {
      this._ensContract = await (this._registryAddress
        ? ENS.at(this._registryAddress)
        : // Can't easily fake a deployed test network
          // istanbul ignore next
          ENS.deployed());
    }

    return this._ensContract;
  }

  /**
   * Resolves a namehash'ed node to it's resolver contract and ttl
   *
   * @param {string} node - namehashed node
   * @returns {Promise<{resolver, ttl: *}>} - resolver and ttl for node
   * @private
   */
  async _resolveNode(node) {
    const ens = await this._getEnsContract();

    const [resolverAddress, ttl] = await Promise.all([
      ens.resolver.call(node),
      ens.ttl.call(node)
    ]);

    return {
      resolver: await SoyPublicResolver.at(resolverAddress),
      ttl: ttl.toNumber()
    };
  }

  /**
   * Resolves the content hash for a node name
   *
   * @param {string} name - The name of a node
   * @returns {Promise<string>} - The content hash of the node
   */
  async resolveContenthash(name) {
    const node = namehash.hash(name);
    const key = `${node}::contenthash`;
    const cachedHash = this._cache.get(key);

    if (cachedHash) {
      return cachedHash;
    }

    const { resolver, ttl } = await this._resolveNode(node);
    const hash = Web3.utils.hexToAscii(await resolver.contenthash.call(node));
    this._cache.set(key, hash, ttl * 1000);

    return hash;
  }
}

module.exports = EnsResolver;
