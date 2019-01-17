const path = require('path');
const Soy = require('./Soy');
const Resolver = require('./Resolver');
const {
  setupEnsContracts,
  registerAndPublishRevision
} = require('../test/setup');

const { web3 } = global;

describe('Soy', () => {
  const contentHash1 = '/ipfs/QmVyYoFQ8KDLMUWhzxTn24js9g5BiC6QX3ZswfQ56T7A5T';
  const contentHash2 = '/ipfs/QmVyYoFQ8KDLMUWhzxTn24js9g5BiC6QX3ZswfQ56T7A5U';
  const domain = 'web3studio.test';
  let soy;

  beforeAll(async () => {
    soy = await setupEnsContracts();

    await registerAndPublishRevision(soy, domain, contentHash1);
  });

  it('defaults to a deployed resolver address', async () => {
    const noResolverSoy = new Soy(web3.currentProvider, {
      registryAddress: (await soy.ens.registry()).address
    });

    let error;

    try {
      await noResolverSoy._getResolverContract();
    } catch (e) {
      error = e;
    }

    // Because it's a test environment where there is no deployed network, we
    // expect that fetching it will fail this way.
    expect(error.message).toBe(
      'SoyPublicResolver has not been deployed to detected network ' +
        '(network/artifact mismatch)'
    );
  });

  it('can register a domain', async () => {
    const resolver = await soy.registerDomain('test.test');
    const publicResolver = await soy._getResolverContract();

    expect(resolver).toBeInstanceOf(Resolver);

    expect(resolver.address).toBe(publicResolver.address);
  });

  it('resolves a domain to a helper contract', async () => {
    const resolver = await soy.resolver(domain);
    expect(resolver).toBeInstanceOf(Resolver);

    expect(await resolver.contenthash()).toBe(contentHash1);
  });

  it('can publish a revision', async () => {
    const resolver = await soy.resolver(domain);
    await resolver.publishRevision(contentHash2);

    expect(await resolver.contenthash()).toBe(contentHash2);
  });

  it('can perform a blue green deploy', async () => {
    const resolver = await soy.resolver(domain);

    await resolver.setDefaultAlias('green');

    await resolver.publishRevision(contentHash1);
    expect(await resolver.contenthash()).toBe(contentHash1);

    // Published new, old content hash is still in effect
    const hash2Revision = await resolver.publishRevision(contentHash2, 'blue');
    expect(await resolver.contenthash()).toBe(contentHash1);

    await resolver.setRevisionAlias(hash2Revision, 'green');
    expect(await resolver.contenthash()).toBe(contentHash2);
  });

  it("defaults to infura's ipfs", async () => {
    const infuraSoy = new Soy(web3.currentProvider);

    expect(await infuraSoy.ipfs.util.getEndpointConfig()).toEqual({
      host: 'ipfs.infura.io',
      port: 5001
    });
  });

  it('can upload and publish a revision', async () => {
    const result = await soy.uploadToIPFSAndPublish(
      path.join(__dirname, '../test/fixtures/site'),
      domain
    );

    expect(result).toEqual(
      expect.objectContaining({
        hash: '/ipfs/QmPHukTJAvBpSeMz3gUkWz8UzX6dPX8JtNxCeEWMnUN3bD'
      })
    );
  });
});
