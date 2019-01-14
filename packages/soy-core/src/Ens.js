const Web3 = require('web3');
const Cache = require('lru-cache');
const namehash = require('eth-ens-namehash');
const { SoyPublicResolver, ENS } = require('soy-contracts');

/**
 * Soy's ENS resolver which caches all results per domain's TTL set by it's resolver.
 *
 * @example <caption>Get the `contenthash` for a domain</caption>
 * ```js
 * const siteHash = soy.ens.getContentHash('web3studio.eth');
 * ```
 */
class Ens {
  /**
   * Constructor
   *
   * @param {Object} provider - A web3@1 provider, defaults to localhost
   * @param {string} [registryAddress] - An optional registry address for bespoke networks
   *
   * @see Use [Soy](#Soy) for creation
   */
  constructor(provider, registryAddress) {
    this._cache = new Cache();
    this._defaultTTL = 10; //seconds

    SoyPublicResolver.setProvider(provider);
    ENS.setProvider(provider);

    this._registryAddress = registryAddress;
    this._registryContract = null;
  }

  /**
   * Memoize a function call based on the ens contract's ttl
   *
   * @param {Function} fn - function to be memoized
   * @param {string} name - cache key, name of the function
   * @param {string} node - node to associate with a ttl
   * @param {Function=} maxAgeFn - Optional function to calculate a ttl
   * @returns {Promise<*>} - returns the maybe cached value of the function
   * @private
   */
  async _memoize(fn, name, node, maxAgeFn = () => this._getNodeTTL(node)) {
    const key = `${node}::${name}`;
    const cachedValue = this._cache.get(key);

    if (cachedValue) {
      return cachedValue;
    }

    const value = await fn();

    this._cache.set(key, value, await maxAgeFn(value));

    return value;
  }

  /**
   * Creates or returns an ENS registry contract
   *
   * @returns {Promise<Contract>} - A promise for a registry contract
   * @private
   */
  async registry() {
    if (!this._registryContract) {
      this._registryContract = await (this._registryAddress
        ? ENS.at(this._registryAddress)
        : // Can't easily fake a deployed test network
          // istanbul ignore next
          ENS.deployed());
    }

    return this._registryContract;
  }

  /**
   * Resolves a namehash'ed node to it's resolver contract and ttl
   *
   * @param {string} node - namehashed node
   * @returns {Promise<{resolver, ttl: *}>} - resolver and ttl for node
   * @private
   */
  async _getNodeResolverAddress(node) {
    return this._memoize(
      async () => {
        const registry = await this.registry();

        return registry.resolver(node);
      },
      'nodeResolverAddress',
      node
    );
  }

  /**
   * Get the ttl of a node, updates every ttl
   *
   * @param {string} node - ens node
   * @returns {Promise<number>} - the ttl of the node
   * @private
   */
  async _getNodeTTL(node) {
    return this._memoize(
      async () => {
        const registry = await this.registry();
        const ttl = await registry.ttl(node);

        return ttl.toNumber() * 1000;
      },
      'ttl',
      node,
      ttl => ttl
    );
  }

  /**
   * Gets a resolver contract instance for a registered ENS domain
   *
   * @param {string} domain - ENS domain (eg: web3studio.eth)
   * @returns {Promise<SoyPublicResolver>} Resolver for a domain
   */
  async resolver(domain) {
    const node = namehash.hash(domain);
    const resolverAddress = await this._getNodeResolverAddress(node);

    return SoyPublicResolver.at(resolverAddress);
  }

  /**
   * Resolves the `contenthash` for an ENS domain
   *
   * @param {string} domain - ENS domain (eg: web3studio.eth)
   * @returns {Promise<string>} The `contenthash` for the ENS domain
   */
  async getContentHash(domain) {
    const node = namehash.hash(domain);

    return this._memoize(
      async () => {
        const resolver = await this.resolver(domain);
        return Web3.utils.hexToAscii(await resolver.contenthash(node));
      },
      'contenthash',
      node
    );
  }
}

module.exports = Ens;
