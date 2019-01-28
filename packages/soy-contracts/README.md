<h1 align="center">
  <br/>
  <a href='https://github.com/ConsenSys/web3studio-soy'><img
      width='250px'
      alt=''
      src="https://user-images.githubusercontent.com/5770007/50840308-2f093000-1330-11e9-996a-2e61a8b7fd9a.png" /></a>
  <br/>
  Contracts
  <br/>
</h1>

<h4 align="center">
  ENS+IPFS ❤ DevOps - Static Websites on the Distributed Web
</h4>

<p align="center">
  <a href="#setup">Setup</a> ∙
  <a href="#api">API</a> ∙
  <a href="#license">License</a>
</p>

Soy Contracts is the source code for Soy's public ENS resolver and a low level JS interface to the contracts.

<br/>

## Usage

### Install

```bash
# Yarn
$ yarn add soy-contracts

# npm
$ npm install --save soy-contracts
```

### API

`soy-contracts` exports two smart contracts wrapped by [truffle-contract][truffle-contract].
If you're familiar with the [Truffle console][truffle-console], then the api should feel natural.

The two contract's are named exports and are:

- `ENS`: The main ENS registry contract, [source][ens-registry-contract].
- `SoyPublicResolver`: Soy's public resolver implementation, [source][soy-public-resolver-contract]

For more details about API for each contract, refer to
[Truffle's documentation][truffle-contract-docs] and the source above.

### Examples

### Deploying and Configuring Test Contracts

```js
const { SoyPublicResolver, ENS } = require('soy-contracts');

const rootNode = web3.utils.asciiToHex(0);
const provider = web3.currentProvider;
const accounts = await web3.eth.getAccounts();
const txOps = { from: accounts[0] };

ENS.setProvider(provider);
ENS.defaults(txOps);
SoyPublicResolver.setProvider(provider);
SoyPublicResolver.defaults(txOps);

const registryContract = await ENS.new(txOps);
const resolverContract = await SoyPublicResolver.new(
  registryContract.address,
  txOps
);

await registryContract.setSubnodeOwner(
  rootNode,
  web3.utils.sha3(tld),
  txOps.from,
  txOps
);
```

## Contributing

Please read through our [contributing guidelines][contributing].
Included are directions for coding standards, and notes on development.

### Deploying a new Public Resolver

**NB: For maintainers only**

Create a `.env` file in `packages/soy-contracts` and add `INFURA_API_KEY` and `WALLET_MNEMONIC`.

```.env
INFURA_API_KEY="Some api key"
WALLET_MNEMONIC="Team's wallet mnemonic"
```

Then follow below:

```bash
# Build a fresh set of contract assets
$ yarn build

# Test local deployment for issues, you'll need ganache running on the computer
$ yarn truffle deploy

# If everything goes well, run for each network
$ yarn truffle deploy --network ropsten
$ yarn truffle deploy --network rinkeby

# Check current [gas prices](https://ethgasstation.info/) and update
# `truffle-config.js`'s mainnet configuration
$ yarn truffle deploy --network mainnet

# When done, update the network locations in `src/SoyPublicResolver.js` with new addresses
```

## License

[Apache 2.0][license]

[license]: https://github.com/ConsenSys/web3studio-soy/blob/master/packages/soy-contracts/LICENSE
[contributing]: https://github.com/ConsenSys/web3studio-soy/blob/master/packages/soy-core/CONTRIBUTING.md
[soy-public-resolver-contract]: https://github.com/ConsenSys/web3studio-soy/blob/master/packages/soy-contracts/contracts/SoyPublicResolver.sol
[ens-registry-contract]: https://github.com/ensdomains/ens/blob/master/contracts/ENSRegistry.sol
[truffle-contract]: https://github.com/trufflesuite/truffle/tree/next/packages/truffle-contract
[truffle-contract-docs]: https://truffleframework.com/docs/truffle/getting-started/interacting-with-your-contracts
[truffle-console]: https://truffleframework.com/docs/truffle/getting-started/using-truffle-develop-and-the-console
