const event = require('./cf-response.json');

/**
 * Cloudfront viewer request event factory!
 *
 * @returns {Object} - A viewer request event
 */
module.exports = () => JSON.parse(JSON.stringify(event));
