const namehash = require('eth-ens-namehash');
const Web3 = require('web3');
const uniq = require('lodash/uniq');

/**
 * A nod specific resolver
 */
class Resolver {
  /**
   * Create a unique contract instance with common params filled in.
   * Wraps all methods of [SoyPublicResolver](https://github.com/ConsenSys/web3studio-soy/blob/master/packages/soy-contracts/contracts/SoyPublicResolver.sol)
   * and by extension the base [PublicResolver](https://github.com/ensdomains/resolvers/blob/master/contracts/PublicResolver.sol)
   * without the need to specify a namehashed domain and tedious unit conversions.
   *
   * [`truffle-contract`](https://github.com/trufflesuite/truffle/tree/next/packages/truffle-contract)
   * is used to generate the interface. For more detailed explanations, see their
   * [docs](https://truffleframework.com/docs/truffle/getting-started/interacting-with-your-contracts)
   *
   * @param {string} domain - ens domain
   * @param {SoyPublicResolver} resolver - A resolver contract
   *
   * @see Use [Soy.resolver](#Soy+resolver) for creation
   */
  constructor(domain, resolver) {
    const node = namehash.hash(domain);

    Object.keys(resolver).forEach(
      property => (this[property] = resolver[property])
    );

    // Fill in `node` for all methods that have it as a first param
    uniq(
      resolver.abi
        .filter(
          method =>
            method.type === 'function' &&
            method.inputs[0] &&
            method.inputs[0].name === 'node'
        )
        .map(method => method.name)
    ).forEach(method => {
      this[method] = resolver[method].bind(resolver, node);
    });

    /**
     * Publishes the content hash as a revision
     *
     * @param {string} contentHash - Content hash to publish for your site
     * @param {string} [alias] - alias to set for this hash
     * @param {Object} [txOps] - web3 transactions options object
     * @returns {Promise<number>} The revision number
     */
    this.publishRevision = async (contentHash, alias, txOps) => {
      const publishArgs = [
        node,
        Web3.utils.asciiToHex(contentHash),
        alias,
        txOps
      ].filter(x => x);

      let result;

      if (alias) {
        // Truffle doesn't handle overloaded functions well...
        result = await resolver.methods[
          'publishRevision(bytes32,bytes,string)'
        ].call(...publishArgs);
      } else {
        result = await resolver.publishRevision.call(...publishArgs);
      }

      await resolver.publishRevision(...publishArgs);

      return result.toNumber();
    };

    /**
     * Get the current contenthash
     *
     * @returns {Promise<string>} current resolver content hash
     */
    this.contenthash = async () => {
      const hash = await resolver.contenthash(node);
      return Web3.utils.hexToAscii(hash);
    };
  }
}

module.exports = Resolver;
