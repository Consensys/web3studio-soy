// Allow logging to cli console
/* eslint-disable no-console */

const ENSRegistry = artifacts.require('ENSRegistry.sol');
const PublicResolver = artifacts.require('SoyPublicResolver.sol');
const namehash = require('eth-ens-namehash');
const pako = require('pako');

const contentHash = '/ipfs/QmVyYoFQ8KDLMUWhzxTn24js9g5BiC6QX3ZswfQ56T7A5T';
const name = 'web3studio';
const tld = 'eth';
const address = `${name}.${tld}`;
const node = namehash.hash(address);

module.exports = async () => {
  try {
    const ensRegistry = await ENSRegistry.deployed();
    const resolver = await PublicResolver.deployed();
    const accounts = await web3.eth.getAccounts();
    const owner = accounts[0];
    const fromOwner = { from: owner };
    const compressedABI = web3.utils.asciiToHex(
      pako.deflate(JSON.stringify(PublicResolver.abi), {
        to: 'string'
      })
    );

    console.log(`Setting ${address} owner`);
    await ensRegistry.setSubnodeOwner(
      namehash.hash(tld),
      web3.utils.sha3(name),
      owner,
      fromOwner
    );

    console.log(`Setting ${address} resolver`);
    await ensRegistry.setResolver(node, PublicResolver.address, fromOwner);
    await ensRegistry.setTTL(node, 300); // 5 min
    await resolver.setABI(
      node,
      2, //zlib-compressed JSON
      compressedABI,
      fromOwner
    );

    console.log(`Publishing ${address} revision`);
    await resolver.publishRevision(
      node,
      web3.utils.asciiToHex(contentHash),
      fromOwner
    );
  } catch (e) {
    console.error(e);
  }
};
