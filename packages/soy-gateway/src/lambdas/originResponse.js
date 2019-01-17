/**
 * Origin response lambda handler.
 *
 * This lambda takes the response from the origin and modifies it. It's purpose
 * is to take origin redirects and re-map them to the path expected from the request
 *
 * @param {Object} event - Cloudfront event
 * @returns {Promise<Object>} - response object
 */
exports.handler = async event => {
  const response = event.Records[0].cf.response;
  const request = event.Records[0].cf.request;

  // Normalize the redirect location to the request path
  if (response.status === '301' || response.status === '302') {
    const redirectLocation = response.headers['location'][0].value;
    const requestUriPosition = redirectLocation.indexOf(request.uri);

    if (requestUriPosition > 0) {
      response.headers['location'][0].value = redirectLocation.substr(
        requestUriPosition
      );
    }
  }

  return response;
};
