/**
 * Origin request lambda handler.
 *
 * This lambda takes the output of the viewer request lambda and updates the
 * path of origin (set to an ipfs gateway) to be the content hash. Additional
 * path information (like /index.html) is in the `request.uri` and passed along
 * to the origin that way.
 *
 * @param {Object} event - Cloudfront event
 * @returns {Promise<Object>} - Request or response object
 */
exports.handler = async event => {
  const request = event.Records[0].cf.request;
  const ipfsRootHeader = request.headers['x-ipfs-root'];
  const ipfsRoot = ipfsRootHeader ? ipfsRootHeader[0].value : null;

  if (!ipfsRoot) {
    return {
      status: 404,
      statusDescription: 'Not Found'
    };
  }

  if (request.uri !== ipfsRoot) {
    request.origin = {
      custom: {
        ...request.origin.custom,
        path: ipfsRoot
      }
    };
  }

  return request;
};
