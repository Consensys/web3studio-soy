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
      port: 8555, // <-- If you change this, also set the port option in .solcover.js.
      gas: 0xfffffffffff, // <-- Use this high gas value
      gasPrice: 0x01 // <-- Use this low gas price
    }
  },
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      currency: 'USD',
      gasPrice: 5
    }
  },

  compilers: {
    solc: {
      version: '^0.4.25'
    }
  }
};
