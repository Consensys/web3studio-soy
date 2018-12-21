const { SoyPublicResolver } = require('soy-contracts');
const Soy = require('./Soy');
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
    soy = await setupEnsContracts(web3, 'test', { from: accounts[0] });

    await registerAndPublishRevision(soy, domain, contentHash1);
  });

  it('uses the globally scoped web3', async () => {
    const globalSoy = new Soy({
      registryAddress: (await soy.ens.registry()).address
    });
    const resolver = await globalSoy.resolver(domain);
    expect(await resolver.contenthash()).toBe(contentHash1);
  });

  it('can register a domain', async () => {
    const resolver = await soy.registerDomain('test.test');
    const publicResolver = await soy._getResolverContract();

    expect(resolver).toBeInstanceOf(SoyPublicResolver);

    expect(resolver.address).toBe(publicResolver.address);
  });

  it('resolves a domain to a helper contract', async () => {
    const resolver = await soy.resolver(domain);
    expect(resolver).toBeInstanceOf(SoyPublicResolver);

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
});
