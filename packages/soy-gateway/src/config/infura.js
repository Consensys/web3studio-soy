const Web3 = require('web3');

module.exports = () => {
  const apiKey = process.env.INFURA_API_KEY;
  const network = process.env.INFURA_NETWORK;

  if (!network || !apiKey) {
    throw new Error(
      'Configuration error: `INFURA_NETWORK` requires an `INFURA_API_KEY`'
    );
  }

  return {
    provider: new Web3.providers.HttpProvider(
      `https://${network}.infura.io/v3/${apiKey}`
    ),
    ensTld: network === 'mainnet' ? 'eth' : 'test',
    registryAddress: null
  };
};
