const {
  setupEnsContracts,
  registerAndPublishRevision
} = require('soy-core/test/setup');
const cfRequestEvent = require('../../test/fixtures/cf-request');

describe('Viewer Request Lambda', () => {
  const contentHash = '/ipfs/QmVyYoFQ8KDLMUWhzxTn24js9g5BiC6QX3ZswfQ56T7A5T';

  let handler;
  let event;
  let request;

  beforeAll(async () => {
    const soy = await setupEnsContracts(web3, 'test', { from: accounts[0] });

    await registerAndPublishRevision(soy, 'web3studio.test', contentHash);
    await registerAndPublishRevision(
      soy,
      'trailing-slash.test',
      `${contentHash}/`
    );

    global.testRegistryAddress = (await soy.ens.registry()).address;
    const lambda = require('./viewerRequest');
    handler = lambda.handler;
  });

  beforeEach(() => {
    event = cfRequestEvent();
    request = event.Records[0].cf.request;
  });

  it('it sets the domain path to an ipfs-path passed as a header', async () => {
    const originRequest = await handler(event);

    expect(originRequest.headers['x-ipfs-path'][0]).toEqual(
      expect.objectContaining({
        key: 'X-Ipfs-Path',
        value: contentHash + request.uri
      })
    );
    expect(originRequest.headers['x-ipfs-root'][0]).toEqual(
      expect.objectContaining({
        key: 'X-Ipfs-Root',
        value: contentHash
      })
    );
  });

  it('it correctly sets the path if the content hash has a trailing slash', async () => {
    request.headers.host[0].value = 'trailing-slash.eth.soy';
    const originRequest = await handler(event);

    expect(originRequest.headers['x-ipfs-path'][0]).toEqual(
      expect.objectContaining({
        key: 'X-Ipfs-Path',
        value: contentHash + request.uri
      })
    );
    expect(originRequest.headers['x-ipfs-root'][0]).toEqual(
      expect.objectContaining({
        key: 'X-Ipfs-Root',
        value: contentHash
      })
    );
  });

  it('it 404s if the ens domain does not exist', async () => {
    request.headers.host[0].value = 'not-registered.eth.soy';

    const response = await handler(event);

    expect(response).toEqual({
      status: 404,
      statusDescription: 'Not Found'
    });
  });

  it('it passes the request if it is an ipfs path', async () => {
    request.uri = contentHash;

    const originRequest = await handler(event);

    expect(originRequest.headers['x-ipfs-path'][0]).toEqual(
      expect.objectContaining({
        key: 'X-Ipfs-Path',
        value: contentHash
      })
    );
    expect(originRequest.headers['x-ipfs-root'][0]).toEqual(
      expect.objectContaining({
        key: 'X-Ipfs-Root',
        value: contentHash
      })
    );
  });
});
