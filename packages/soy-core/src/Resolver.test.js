const {
  setupEnsContracts,
  registerAndPublishRevision
} = require('../test/setup');

describe('A Resolver which', () => {
  const contentHash1 = '/ipfs/QmVyYoFQ8KDLMUWhzxTn24js9g5BiC6QX3ZswfQ56T7A5T';
  const contentHash2 = '/ipfs/QmVyYoFQ8KDLMUWhzxTn24js9g5BiC6QX3ZswfQ56T7A5U';
  const domain = 'web3studio.test';
  let soy;
  let resolver;

  beforeAll(async () => {
    soy = await setupEnsContracts();

    await registerAndPublishRevision(soy, domain, contentHash1);
  });

  beforeEach(async () => {
    resolver = await soy.resolver(domain);
  });

  it('can get a content hash', async () => {
    expect(await resolver.contenthash()).toBe(contentHash1);
  });

  it('can publish revisions', async () => {
    const rev1 = await resolver.publishRevision(contentHash1);
    const rev2 = await resolver.publishRevision(contentHash2);

    expect(await resolver.contenthash()).toBe(contentHash2);
    // Revisions are numbers and each revision # increments
    expect(rev2 - rev1).toBe(1);
  });

  it('uses default getters/settings without a node provided', async () => {
    const key = 'pinkie';
    const value = "Pinkie's pies can only be launched from party cannons";
    // Limited to the getters and setters that deal with strings for simplicity
    const textMethods = [
      ['name', 'setName'],
      ['defaultAlias', 'setDefaultAlias'],
      ['contenthash', 'publishRevision']
    ];

    await Promise.all(
      textMethods.map(async ([getter, setter]) => {
        await resolver[setter](value);

        expect(await resolver[getter]()).toBe(value);
      })
    );

    await resolver.setText(key, value);
    expect(await resolver.text(key)).toBe(value);
  });
});
