/**
 * @file Used by lambda-build-tools to customize the webpack config for this project
 */

const { DefinePlugin } = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const path = require('path');

require('dotenv').config();

/**
 * Resolves module path to this package's node_modules. Prevents dupes.
 *
 * @param {string} modulePath - Relative path to the module starting from node_modules
 * @returns {string} - The fully qualified path
 */
const resolveModule = modulePath =>
  path.resolve(__dirname, '../../../node_modules/', modulePath);

const testPattern = /\.test\.js$/;

module.exports = config => {
  config.devtool = 'cheap-source-map';
  // Remove test entries from being built
  config.entry = Object.entries(config.entry).reduce(
    (entry, [file, entries]) => {
      if (!file.match(testPattern)) {
        entry[file] = entries;
      }

      return entry;
    },
    {}
  );

  // Lambda@Edge has strict file size requirements. Keeping everyone in a separate
  // folder allows for sourcemaps to fit in that
  config.output.filename = '[name]/index.js';

  // Using browser dependencies to avoid complicated install and to shrink bundle size
  config.resolve.mainFields = ['browser', 'main'];

  config.resolve.alias = {
    // Some of the browser deps don't work 🤷‍♀️
    oboe: resolveModule('oboe/dist/oboe-node.js'),
    'form-data': resolveModule('form-data/lib/form_data'),

    // Web3@1 locks versions, this de-dupes the bundle
    'bn.js': resolveModule('bn.js'),
    elliptic: resolveModule('elliptic'),
    'web3-core-helpers': resolveModule('web3-core-helpers'),
    'web3-core-method': resolveModule('web3-core-method'),
    'web3-core-subscriptions': resolveModule('web3-core-subscriptions'),
    'web3-core-requestmanager': resolveModule('web3-core-requestmanager'),
    'web3-eth': resolveModule('web3-eth'),
    'web3-eth-abi': resolveModule('web3-eth-abi'),
    'web3-eth-accounts': resolveModule('web3-eth-accounts'),
    'web3-eth-contract': resolveModule('web3-eth-contract'),
    'web3-utils': resolveModule('web3-utils')
  };

  config.plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: path.join(__dirname, '../build/report.html')
    })
  );

  // Lambda@Edge doesn't support env variables, injecting them at build time instead
  config.plugins.push(
    new DefinePlugin({
      'process.env.NODE_CONFIG_ENV': JSON.stringify(
        process.env.NODE_CONFIG_ENV
      ),
      'process.env.INFURA_API_KEY': JSON.stringify(process.env.INFURA_API_KEY),
      'process.env.INFURA_NETWORK': JSON.stringify(process.env.INFURA_NETWORK)
    })
  );

  return config;
};
