<h1 align="center">
  <br/>
  <a href='https://github.com/ConsenSys/web3studio-soy'><img 
      width='250px' 
      alt='' 
      src="https://user-images.githubusercontent.com/5770007/50840308-2f093000-1330-11e9-996a-2e61a8b7fd9a.png" /></a>
  <br/>
</h1>

<h4 align="center">
  ENS+IPFS ❤ DevOps - Static Websites on the Distributed Web
</h4>

<p align="center">
  <a href="#usage">Usage</a> ∙
  <a href="#packages">Packages</a> ∙
  <a href="#contributing">Contributing</a> ∙
  <a href="#license">License</a>
</p>

Soy is a collection of smart contracts and tools to enable you to build your site
on the distributed web. By virtue of using [ENS](https://ens.domains/) and
[IPFS](https://ipfs.io/) your content will be quickly accessible all over the world without
having to set up or manage any infrastructure.

Already have an ENS resolver? Add `.soy` to the end to see it in your browser! Check
out [web3studio.eth.soy][web3studio.eth.soy]

<br/>

## Usage

### Install

```bash
# Yarn
$ yarn add --dev soy-core

# NPM
$ npm install --save-dev soy-core
```

### Configure

Create a new soy instance and give it any Web3 provider.

```js
const Soy = require('soy-core');
const HDWalletProvider = require('truffle-hdwallet-provider');

const mnemonic = process.env.WALLET_MNEMONIC;
const infuraApiKey = process.env.INFURA_API_KEY;
const infuraNetwork = process.env.INFURA_NETWORK;
const provider = new HDWalletProvider(
  mnemonic,
  `https://${infuraNetwork}.infura.io/v3/${infuraApiKey}`
);

const soy = new Soy({ provider });
```

### Register an ENS Domain with Soy

After [purchasing an ENS Domain](https://www.myetherwallet.com/#ens) you can
register it with Soy

```js
const resolver = await soy.registerDomain('example.madewith.eth');
```

### Using the Resolver

With a registered domain, you can now publish content revisions, use aliases, or
use it like a normal ENS contract.

```js
const resolver = await soy.resolver('example.madewith.eth');

await resolver.publishRevision(
  '/ipfs/QmVyYoFQ8KDLMUWhzxTn24js9g5BiC6QX3ZswfQ56T7A5T'
);
```

### View Your Beautiful Site

Once you have ENS set up to point to an ipfs hash, simply add `.soy` to the ENS
domain in your browser. For example, web3studio.eth becomes
[web3studio.eth.soy][web3studio.eth.soy].

## Examples

### First time registering a domain and publishing a hash

```js
const Soy = require('soy-core');
const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');

// Change these paremeters or pass them in as env variables
const mnemonic = process.env.WALLET_MNEMONIC;
const infuraApiKey = process.env.INFURA_API_KEY;
const infuraNetwork = process.env.INFURA_NETWORK || 'rinkeby';
const contentHash = '/ipfs/QmVyYoFQ8KDLMUWhzxTn24js9g5BiC6QX3ZswfQ56T7A5T';
const domain = 'soyexample.test';

var provider = new HDWalletProvider(
  mnemonic,
  `https://${infuraNetwork}.infura.io/v3/${infuraApiKey}`
);

(async () => {
  const web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();
  const owner = accounts[0];

  const soy = new Soy({ provider, from: owner });

  const resolver = await soy.registerDomain(domain);
  const revision = await resolver.publishRevision(contentHash);

  console.log(`Revision ${revision} published by Soy!`);
})().catch(console.log);
```

## Packages

Soy consists of a bunch of tools that make hosting distributed web sites easy. They are:

### [`soy-contracts`][soy-contracts]

Contracts contains the source of the solidity contracts and a low level interface
for interactions via [`truffle-contract`][truffle-contract].

For more information, see [`soy-contracts`][soy-contracts]'s main page.

### [`soy-gateway`][soy-gateway]

The gateway is the source code behind eth.soy. It's a shim to enable browsers to
support distributed file systems over ENS until browsers can handle this natively.

For more information, see [`soy-gateway`][soy-gateway]'s main page.

### [`soy-core`][soy-core]

The core project contains a friendly js interface to interacting with the deployed
contracts of [`soy-contracts`][soy-contracts] enabling you to get your content out there with ease.

## Contributing

Please read through our [contributing guidelines][contributing].
Included are directions for coding standards, and notes on development.

## License

[Apache 2.0][license]

[soy-contracts]: https://github.com/ConsenSys/web3studio-soy/tree/master/packages/soy-contracts
[soy-gateway]: https://github.com/ConsenSys/web3studio-soy/tree/master/packages/soy-gateway
[soy-core]: https://github.com/ConsenSys/web3studio-soy/tree/master/packages/soy-core
[license]: https://github.com/ConsenSys/web3studio-soy/blob/master/packages/soy-core/LICENSE
[contributing]: https://github.com/ConsenSys/web3studio-soy/blob/master/packages/soy-core/CONTRIBUTING.md
[truffle-contract]: https://github.com/trufflesuite/truffle/tree/next/packages/truffle-contract
[web3studio.eth.soy]: https://web3studio.eth.soy