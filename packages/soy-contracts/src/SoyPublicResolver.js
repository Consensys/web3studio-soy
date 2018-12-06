const contract = require('truffle-contract');
const SoyPublicResolver = require('../build/contracts/SoyPublicResolver.json');

module.exports = contract(SoyPublicResolver);
