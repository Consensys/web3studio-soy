const { SoyPublicResolver } = require('soy-contracts');
const Ens = require('./Ens');
const {
  setupEnsContracts,
  registerAndPublishRevision
} = require('../test/setup');

const { web3 } = global;

describe('ENS utility', () => {
  const contentHash = '/ipfs/QmVyYoFQ8KDLMUWhzxTn24js9g5BiC6QX3ZswfQ56T7A5T';
  const domain = 'web3studio.test';

  let registryAddress;
  let ens;

  beforeAll(async () => {
    const soy = await setupEnsContracts();

    await registerAndPublishRevision(soy, domain, contentHash);
    registryAddress = (await soy.ens.registry()).address;
  });

  beforeEach(() => {
    ens = new Ens(web3.currentProvider, registryAddress);
  });

  it('it resolves a domain to a contract', async () => {
    expect(await ens.resolver(domain)).toBeInstanceOf(SoyPublicResolver);
  });

  it('it resolves a domain to a contentHash', async () => {
    expect(await ens.getContentHash(domain)).toBe(contentHash);
  });

  it('Caches the resolved node', async () => {
    const registry = await ens.registry();
    const registryResolveSpy = jest.spyOn(registry, 'resolver');

    await ens.getContentHash(domain);
    expect(registryResolveSpy).toHaveBeenCalledTimes(1);
    await ens.getContentHash(domain);
    expect(registryResolveSpy).toHaveBeenCalledTimes(1);
  });

  it('Caches the ens registry contract', async () => {
    expect(await ens.registry()).toBe(await ens.registry());
  });
});
