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
    const soy = await setupEnsContracts(web3, 'test', { from: accounts[0] });

    await registerAndPublishRevision(soy, domain, contentHash);
    registryAddress = (await soy.registryContract()).address;
  });

  beforeEach(() => {
    ens = new Ens(web3.currentProvider, registryAddress);
  });

  it('it sets the domain path to an ipfs-path passed as a header', async () => {
    expect(await ens.resolveContenthash(domain)).toBe(contentHash);
  });

  it('Caches the resolved node', async () => {
    const resolveNodeSpy = jest.spyOn(ens, '_resolveNode');

    await ens.resolveContenthash(domain);
    expect(resolveNodeSpy).toHaveBeenCalledTimes(1);
    await ens.resolveContenthash(domain);
    expect(resolveNodeSpy).toHaveBeenCalledTimes(1);
  });

  it('Caches the resolved node', async () => {
    const resolveNodeSpy = jest.spyOn(ens, '_resolveNode');

    await ens.resolveContenthash(domain);
    expect(resolveNodeSpy).toHaveBeenCalledTimes(1);
    await ens.resolveContenthash(domain);
    expect(resolveNodeSpy).toHaveBeenCalledTimes(1);
  });

  it('Caches the ens registry contract', async () => {
    expect(await ens._getEnsContract()).toBe(await ens._getEnsContract());
  });
});
