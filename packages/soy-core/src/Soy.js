const { SoyPublicResolver, ENS } = require('soy-contracts');
const Web3 = require('web3');
const namehash = require('eth-ens-namehash');
const ipfsClient = require('ipfs-http-client');
const Resolver = require('./Resolver');
const Ens = require('./Ens');

const infuraIPFSConfig = {
  host: 'ipfs.infura.io',
  port: 5001,
  options: {
    protocol: 'https'
  }
};

/**
 * Soy is the best interface for Soy's smart contracts. It provides an easily
 * scriptable interface for any deployment pattern.
 *
 * @property {ENS} ens - [ENS](#ens) resolver utility
 * @property {Web3} web3 - [web3.js](https://web3js.readthedocs.io/en/1.0/) instance
 * @property {IPFS} ipfs - [ipfs-http-client](https://github.com/ipfs/js-ipfs-http-client#api) instance
 */
class Soy {
  /**
   * Create a new soy instance
   *
   * @param {Web3.Provider} provider - A Web3 provider instance
   * @param {Object} [options] - Soy instance options
   * @param {string} [options.registryAddress] - An address for a deployed ENS registry
   * @param {string} [options.resolverAddress] - An address for a deploy SoyPublicResolver
   * @param {...Object} [options.txOps] - Default [transaction arguments](https://web3js.readthedocs.io/en/1.0/web3-eth.html#sendtransaction) passed to web3
   */
  constructor(provider, options = {}) {
    const {
      registryAddress,
      resolverAddress,
      ipfs = infuraIPFSConfig,
      ...txOps
    } = options;

    // Tests have globally configured web3, can't break this
    // istanbul ignore next
    if (!provider) {
      throw new Error("Couldn't find a valid web3 provider.");
    }

    this._txOps = txOps;

    this.ens = new Ens(provider, registryAddress);
    this.web3 = new Web3(provider);
    this.ipfs = ipfsClient(ipfs.host, ipfs.port, ipfs.options);

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
   * Upload the contents of a directory to ipfs and publishes the root folder's
   * hash as a revision
   *
   * @param {string} path - Path to the directory
   * @param {string} domain - ENS domain to publish a revision
   * @param {Object} [options] - IPFS [options](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#addfromfs)
   * @returns {Promise<{hash: string, rev: number}>} - The hash published and it's revision number
   */
  async uploadToIPFSAndPublish(
    path,
    domain,
    options = { recursive: true, pin: true }
  ) {
    const ipfsFiles = await this.ipfs.addFromFs(path, options);
    const rootFolder = ipfsFiles.find(
      file => file.path.split('/').length === 1
    );
    const hash = `/ipfs/${rootFolder.hash}`;

    const resolver = await this.resolver(domain);

    const rev = await resolver.publishRevision(hash);

    return { hash, rev };
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
