const contract = require('truffle-contract');
const ENS = require('../build/contracts/ENSRegistry.json');

const ENS_ADDRESSES = {
  '1': {
    address: '0x314159265dd8dbb310642f98f50c066173c1259b'
  },
  '3': {
    address: '0x112234455c3a32fd11230c42e7bccd4a84e02010'
  },
  '4': {
    address: '0xe7410170f87102df0055eb195163a03b7f2bff4a'
  }
};

module.exports = contract({
  ...ENS,
  networks: {
    ...ENS.networks,
    ...ENS_ADDRESSES
  }
});
