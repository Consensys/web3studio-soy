<h1 align="center">
  <br/>
  <a href='https://github.com/ConsenSys/web3studio-soy'><img 
      width='250px' 
      alt='' 
      src="https://user-images.githubusercontent.com/5770007/50840308-2f093000-1330-11e9-996a-2e61a8b7fd9a.png" /></a>
  <br/>
  Gateway
  <br/>
</h1>

<h4 align="center">
  ENS+IPFS ❤ DevOps - Static Websites on the Distributed Web
</h4>

<p align="center">
  <a href="#setup">Setup</a> ∙
  <a href="#contributing">Contributing</a> ∙
  <a href="#license">License</a>
</p>

Soy Gateway is the backend behind eth.soy. Have ENS pointing to a `contenthash`?
Add `.soy` to the end to see it in your browser! Check out [web3studio.eth.soy][web3studio.eth.soy].

<br/>

## Setup

Soy Gateway consists of two AWS [Lambda@Edge](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html)
functions. It uses a viewer request lambda to map an incoming request to an ipfs
location and an origin request to rewrite the request for an IPFS gateway.

In order to deploy your own version or contribute changes you'll need to set up a few things:

- [AWS SAM](https://aws.amazon.com/serverless/sam/): AWS Serverless Application Model (SAM) is used to configure the aws infrastructure needed for continuous deployment.
- [aws-cli](https://aws.amazon.com/cli/): AWS CLI is used by SAM. You'll need to [configure](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) it with access keys and secrets.

### Development

Some handy built in scripts will help you run this locally.

- `yarn test` or `yarn jest`: run's [jest](https://jestjs.io) for unit tests. It uses ganache to simulate an Ethereum blockchain.
- `yarn start`: Run's the viewer request function with a test event
- `yarn lambda:build`: Build's the lambdas that are deployed to aws
- `yarn lambda:deploy`: Uses AWS SAM to deploy the lambdas with a cloudfront distribution

## Contributing

Please read through our [contributing guidelines][contributing].
Included are directions for coding standards, and notes on development.

## License

[Apache 2.0][license]

[license]: https://github.com/ConsenSys/web3studio-soy/blob/master/packages/soy-gateway/LICENSE
[contributing]: https://github.com/ConsenSys/web3studio-soy/blob/master/packages/soy-core/CONTRIBUTING.md
[web3studio.eth.soy]: https://web3studio.eth.soy
