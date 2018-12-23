const Soy = require('../');
const Web3 = require('web3');
var HDWalletProvider = require('truffle-hdwallet-provider');

require('dotenv').config();

var mnemonic = process.env.WALLET_MNEMONIC;
const infuraApiKey = process.env.INFURA_API_KEY;
const infuraNetwork = process.env.INFURA_NETWORK;

var provider = new HDWalletProvider(
  mnemonic,
  `https://${infuraNetwork}.infura.io/v3/${infuraApiKey}`
);

(async () => {
  const web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();
  const owner = accounts[0];

  const soy = new Soy({ provider, from: owner });
  const resolver = await soy.getNodeResolver('web3studio.test');

  await resolver.publishRevision(
    '/ipfs/QmVyYoFQ8KDLMUWhzxTn24js9g5BiC6QX3ZswfQ56T7A5T'
  );

  console.log('revision published!');
})().catch(console.log);
