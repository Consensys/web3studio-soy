const {
  setupEnsContracts,
  registerAndPublishRevision
} = require('soy-core/test/setup');
const cfResponseEvent = require('../../test/fixtures/cf-response');
const { handler } = require('./originResponse');

describe('Origin Response Lambda', () => {
  const contentHash = '/ipfs/QmVyYoFQ8KDLMUWhzxTn24js9g5BiC6QX3ZswfQ56T7A5T';

  let event;
  let response;
  let request;

  beforeAll(async () => {
    const soy = await setupEnsContracts(web3, 'test', { from: accounts[0] });

    await registerAndPublishRevision(soy, 'web3studio.test', contentHash);
    await registerAndPublishRevision(
      soy,
      'trailing-slash.test',
      `${contentHash}/`
    );
  });

  beforeEach(() => {
    event = cfResponseEvent();
    response = event.Records[0].cf.response;
    request = event.Records[0].cf.request;
  });

  it('passes response through on non-redirect', async () => {
    const originResponse = await handler(event);

    expect(originResponse).toEqual(response);
  });

  it('passes response through ipfs path redirect', async () => {
    request.uri = `${contentHash}${request.uri}`;

    response.status = '301';
    response.headers.location = [{ key: 'Location', value: `${request.uri}/` }];

    const originResponse = await handler(event);

    expect(originResponse).toEqual(response);
  });

  it('on redirect, normalizes the location to the request uri', async () => {
    response.status = '302';
    response.headers.location = [
      { key: 'Location', value: `${contentHash}${request.uri}/` }
    ];
    const originResponse = await handler(event);

    expect(originResponse.headers['location'][0]).toEqual(
      expect.objectContaining({
        key: 'Location',
        value: `${request.uri}/`
      })
    );
  });
});
