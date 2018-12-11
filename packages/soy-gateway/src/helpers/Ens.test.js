const Ens = require('./Ens');
const EnsSetup = require('../../test/EnsSetup');

const { web3 } = global;

describe('ENS utility', () => {
  const contentHash = '/ipfs/QmVyYoFQ8KDLMUWhzxTn24js9g5BiC6QX3ZswfQ56T7A5T';

  let domain;
  let registryAddress;
  let ens;

  beforeAll(async () => {
    const ensSetup = new EnsSetup('test');

    registryAddress = await ensSetup.createRegistry();
    domain = await ensSetup.register('web3studio', contentHash);
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
