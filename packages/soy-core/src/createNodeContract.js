const namehash = require('eth-ens-namehash');
const Web3 = require('web3');
const uniq = require('lodash/uniq');

/**
 * Create a unique contract instance with common params filled in
 *
 * @param {string} domain - ens domain
 * @param {SoyPublicResolver} resolver - A resolver contract
 * @returns {Promise<SoyPublicResolver>} - a truffle contract instance
 */
module.exports = async function createNodeContract(domain, resolver) {
  const node = namehash.hash(domain);

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
    // set _method so it can be used by later custom helpers
    resolver[`_${method}`] = resolver[method];

    resolver[method] = resolver[method].bind(resolver, node);
  });

  // Custom publish revision so user doesn't have to deal with asciiToHex always
  resolver.publishRevision = async (contentHash, alias, ...args) => {
    const publishArgs = [
      node,
      Web3.utils.asciiToHex(contentHash),
      alias,
      ...args
    ].filter(x => x);
    let result;

    if (alias) {
      // Truffle doesn't handle overloaded functions well...
      result = await resolver.methods[
        'publishRevision(bytes32,bytes,string)'
      ].call(...publishArgs);
    } else {
      result = await resolver._publishRevision.call(...publishArgs);
    }

    await resolver._publishRevision(...publishArgs);

    return result.toNumber();
  };

  resolver.contenthash = async () => {
    const hash = await resolver._contenthash(node);
    return Web3.utils.hexToAscii(hash);
  };

  return resolver;
};
