const infura = require('./infura');
const ganache = require('./ganache');

module.exports = () => {
  if (process.env.NODE_CONFIG_ENV === 'infura') {
    return infura();
  } else {
    return ganache();
  }
};
