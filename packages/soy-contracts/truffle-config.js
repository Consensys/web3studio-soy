const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

require('dotenv').config();

const mnemonic = process.env.WALLET_MNEMONIC;
const infuraApiKey = process.env.INFURA_API_KEY;

/**
 * Create's a provider for a given network
 *
 * @param {string} network - Infura network string (rinkeby, ropsten, mainnet, etc)
 * @returns {Function} function used for truffle config
 * @private
 */
const provider = network => () =>
  new HDWalletProvider(
    mnemonic,
    `https://${network}.infura.io/v3/${infuraApiKey}`
  );

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
    },
    coverage: {
      host: 'localhost',
      network_id: '*',
      port: 8555,
      // Values set from docs https://github.com/sc-forks/solidity-coverage#network-configuration
      gas: 0xfffffffffff,
      gasPrice: 0x01
    },
    mainnet: {
      provider: provider('mainnet'),
      network_id: '1',
      // When deploying to mainnet check https://ethgasstation.info/ for
      // current gas price. "Standard" suggested
      gasPrice: Web3.utils.toWei('0', 'gwei')
    },
    ropsten: {
      provider: provider('ropsten'),
      network_id: '3',
      gasPrice: Web3.utils.toWei('20', 'gwei')
    },
    rinkeby: {
      provider: provider('rinkeby'),
      network_id: '4',
      gasPrice: Web3.utils.toWei('10', 'gwei')
    }
  },
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      currency: 'USD',
      gasPrice: 4
    }
  },
  compilers: {
    solc: {
      version: '^0.4.25'
    }
  }
};
