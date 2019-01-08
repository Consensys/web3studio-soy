const originHandler = require('./originRequest').handler;
const {
  setupEnsContracts,
  registerAndPublishRevision
} = require('soy-core/test/setup');
const cfRequestEvent = require('../../test/fixtures/cf-request');

describe('Origin Request Lambda', () => {
  const contentHash = '/ipfs/QmVyYoFQ8KDLMUWhzxTn24js9g5BiC6QX3ZswfQ56T7A5T';

  let viewerHandler;
  let event;
  let request;

  /**
   * This test suit wouldn't be super interesting if I didn't treat it more like
   * an integration test. This function "mocks" Cloudfront (poorly)
   *
   * @param {Object} event - Cloudfront event
   * @returns {Promise<Object>} - origin handler response
   */
  const simulateCloudfront = async event => {
    const viewerRequest = await viewerHandler(event);

    viewerRequest.origin = {
      custom: {
        customHeaders: {},
        domainName: 'ipfs.infura.io',
        keepaliveTimeout: 5,
        path: '/',
        port: 443,
        protocol: 'https',
        readTimeout: 5,
        sslProtocols: ['TLSv1', 'TLSv1.1']
      }
    };

    return await originHandler({
      ...event,
      request: viewerRequest
    });
  };

  beforeAll(async () => {
    const soy = await setupEnsContracts(web3, 'test', { from: accounts[0] });

    await registerAndPublishRevision(soy, 'web3studio.test', contentHash);

    global.testRegistryAddress = (await soy.ens.registry()).address;
    const lambda = require('./viewerRequest');
    viewerHandler = lambda.handler;
  });

  beforeEach(() => {
    event = cfRequestEvent();
    request = event.Records[0].cf.request;
  });

  it('it sets the origin path to contentHash in the ens record', async () => {
    const originRequest = await simulateCloudfront(event);

    expect(originRequest.origin.custom).toEqual(
      expect.objectContaining({
        path: contentHash
      })
    );
  });

  it('it sets the origin path to contentHash with a nested uri', async () => {
    request.uri = '/static/index.js';

    const originRequest = await simulateCloudfront(event);

    expect(originRequest.origin.custom).toEqual(
      expect.objectContaining({
        path: contentHash
      })
    );
  });

  it('it passes the origin path as root if it is an ipfs path', async () => {
    request.uri = contentHash;

    const originRequest = await simulateCloudfront(event);

    expect(originRequest.origin.custom).toEqual(
      expect.objectContaining({
        path: '/'
      })
    );
  });

  it('it 404s if the ens domain does not exist', async () => {
    request.headers.host[0].value = 'not-registered.eth.soy';

    const response = await simulateCloudfront(event);

    expect(response).toEqual({
      status: 404,
      statusDescription: 'Not Found'
    });
  });
});
