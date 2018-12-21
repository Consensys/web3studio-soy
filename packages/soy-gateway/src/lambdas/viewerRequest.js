const Web3 = require('web3');
const Soy = require('soy-core');

const infuraApiKey = process.env.INFURA_API_KEY;
const infuraNetwork = process.env.INFURA_NETWORK;

// use `.eth` tld for mainnet, `.test` for all others
// Branch required for test setup, can't test itself
// istanbul ignore next
const ensTld = infuraNetwork && infuraNetwork === 'mainnet' ? 'eth' : 'test';

const { web3, testRegistryAddress } = global;

const provider = web3
  ? web3.currentProvider
  : // Branch required for test setup, can't test itself
    // istanbul ignore next
    new Web3.providers.HttpProvider(
      `https://${infuraNetwork}.infura.io/v3/${infuraApiKey}`
    );

// Branch required for test setup, can't test itself
// istanbul ignore next
const registryAddress = testRegistryAddress || null;

const soy = new Soy({ provider, registryAddress });
const ipfsPattern = /^(\/ipfs\/Qm\w{44})(\/?.*)$/;

/**
 * Sets IPFS headers on the request
 *
 * @param {Object} request - Cloudfront request object
 * @param {string} root - IPFS hash location `/ipfs/QM...`
 * @param {string} path - Any additional path information passed the root
 */
const setHeaders = (request, root, path) => {
  // Used as a cache key in cloudfront
  request.headers['x-ipfs-path'] = [
    {
      key: 'X-Ipfs-Path',
      value: `${root}${path}`
    }
  ];

  // Used by the origin request to modify origin path
  request.headers['x-ipfs-root'] = [
    {
      key: 'X-Ipfs-Root',
      value: root
    }
  ];
};

/**
 * Viewer request lambda handler.
 *
 * This lambda takes every request to cloudfront and transforms the host
 * as an ENS entry. The origin request handler maps that the headers added
 * to the origin path. `X-Ipfs-Path` is also used as a cache key as it's immutable
 *
 * @param {Object} event - Cloudfront event
 * @returns {Promise<Object>} - Request or response object
 */
exports.handler = async event => {
  const request = event.Records[0].cf.request;
  const host = request.headers.host[0].value;

  const requestUri = request.uri;
  const ipfsMatch = requestUri.match(ipfsPattern);

  if (ipfsMatch) {
    // Pass through ipfs paths to the gateway
    setHeaders(request, ipfsMatch[1], ipfsMatch[2]);
  } else {
    // Map hostname to ens record and it's root content hash
    const ensDomain = `${host.replace('.eth.soy', '')}.${ensTld}`;

    try {
      let ipfsRoot = await soy.ens.resolveContenthash(ensDomain);

      ipfsRoot = ipfsRoot.endsWith('/') ? ipfsRoot.slice(0, -1) : ipfsRoot;

      setHeaders(request, ipfsRoot, requestUri);
    } catch (e) {
      // 404 if the ens domain doesn't exist or have a contentHash
      return {
        status: 404,
        statusDescription: 'Not Found'
      };
    }
  }

  return request;
};
