const config = require('./index');

describe('infura config', () => {
  /**
   * Sets the test environment variables
   *
   * @param {string} network - Network to set
   */
  function setEnv(network) {
    process.env.INFURA_API_KEY = 'test-value';
    if (network) {
      process.env.INFURA_NETWORK = network;
    }
  }

  beforeAll(() => {
    process.env.NODE_CONFIG_ENV = 'infura';
  });

  afterAll(() => {
    delete process.env.NODE_CONFIG_ENV;
  });

  afterEach(() => {
    delete process.env.INFURA_API_KEY;
    delete process.env.INFURA_NETWORK;
  });

  it('errors without all necessary env vars', () => {
    setEnv(null);

    expect(config).toThrow(Error);
  });

  it('sets tld for mainnet as `eth`', () => {
    setEnv('mainnet');

    expect(config()).toEqual(
      expect.objectContaining({
        ensTld: 'eth'
      })
    );
  });

  it('sets tld for testnets as `test`', () => {
    ['rinkeby', 'ropsten'].forEach(network => {
      setEnv(network);

      expect(config()).toEqual(
        expect.objectContaining({
          ensTld: 'test'
        })
      );
    });
  });
});
