const NodeEnvironment = require('jest-environment-node');
const ganache = require('ganache-cli');
const Web3 = require('web3');

/**
 * Custom jest test environment that provides a test ganache blockchain
 */
class GanacheEnvironment extends NodeEnvironment {
  /**
   * Setup hook, provided by jest. No teardown as nothing long running exists
   */
  async setup() {
    await super.setup();

    const web3 = new Web3(ganache.provider());
    const accounts = await web3.eth.getAccounts();

    this.global.web3 = web3;
    this.global.accounts = accounts;

    this.global.ipfs = {
      host: 'localhost',
      port: '5002',
      options: {
        protocol: 'http'
      }
    };
  }
}

module.exports = GanacheEnvironment;
