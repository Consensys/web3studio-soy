const Soy = require('soy-core');
const config = require('../config');

const { registryAddress, ensTld, provider } = config();
const soy = new Soy(provider, { registryAddress });
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
  const ipfsMatch = requestUri.match(ipfsPattern) || [];
  const ipfsMatchRoot = ipfsMatch[1];
  const ipfsMatchPath = ipfsMatch[2] || '/';

  // Map hostname to ens record and it's root content hash
  const ensDomain = `${host.replace('.eth.soy', '')}.${ensTld}`;

  try {
    let ipfsRoot = await soy.ens.getContentHash(ensDomain);
    let requestPath = requestUri;

    ipfsRoot = ipfsRoot.endsWith('/') ? ipfsRoot.slice(0, -1) : ipfsRoot;

    if (ipfsMatchRoot && ipfsMatchRoot === ipfsRoot) {
      requestPath = ipfsMatchPath;
    }

    setHeaders(request, ipfsRoot, requestPath);
  } catch (e) {
    // 404 if the ens domain doesn't exist or have a contentHash
    return {
      status: 404,
      statusDescription: 'Not Found'
    };
  }

  return request;
};
