const { SoyPublicResolver } = require('soy-contracts');
const Web3 = require('web3');
const uniq = require('lodash/uniq');

/**
 * Create a unique contract instance with common params filled in
 *
 * @param {string} node - namehashed domain
 * @param {string} address - address of the resolver contract
 * @returns {Promise<SoyPublicResolver>} - a truffle contract instance
 */
module.exports = async function createNodeContract(node, address) {
  const resolverContract = await SoyPublicResolver.at(address);

  // Fill in `node` for all methods that have it as a first param
  uniq(
    resolverContract.abi
      .filter(
        method =>
          method.type === 'function' &&
          method.inputs[0] &&
          method.inputs[0].name === 'node'
      )
      .map(method => method.name)
  ).forEach(method => {
    // set _method so it can be used by later custom helpers
    resolverContract[`_${method}`] = resolverContract[method];

    resolverContract[method] = resolverContract[method].bind(
      resolverContract,
      node
    );
  });

  // Custom publish revision so user doesn't have to deal with asciiToHex always
  resolverContract.publishRevision = (contentHash, ...args) =>
    resolverContract._publishRevision(
      node,
      Web3.utils.asciiToHex(contentHash),
      ...args
    );

  return resolverContract;
};
