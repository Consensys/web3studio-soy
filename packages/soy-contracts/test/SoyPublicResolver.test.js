const expect = require('jest-matchers');
const ENS = artifacts.require('@ensdomains/ens/contracts/ENSRegistry.sol');
const PublicResolver = artifacts.require('SoyPublicResolver.sol');

const utils = require('./helpers/Utils.js');
const namehash = require('eth-ens-namehash');

/**
 * Given an array of points, assert they match the resolver's return
 *
 * @param {Object} actual - resolver return object
 * @param {Array} expectedPoints - Array of expected points
 */
function assertPubKey(actual, expectedPoints) {
  expect(actual).toEqual({
    '0': expectedPoints[0],
    '1': expectedPoints[1],
    x: expectedPoints[0],
    y: expectedPoints[1]
  });
}

contract('SoyPublicResolver', function(accounts) {
  const fromAccount0 = { from: accounts[0] };
  const fromAccount1 = { from: accounts[1] };

  let node;
  let ens, resolver;

  beforeEach(async () => {
    node = namehash.hash('eth');
    ens = await ENS.new();
    resolver = await PublicResolver.new(ens.address);

    await ens.setSubnodeOwner(
      web3.utils.asciiToHex(0),
      web3.utils.sha3('eth'),
      accounts[0],
      {
        from: accounts[0]
      }
    );
  });

  describe('fallback function', async () => {
    it('forbids calls to the fallback function with 0 value', async () => {
      expect.hasAssertions();

      try {
        await web3.eth.sendTransaction({
          from: accounts[0],
          to: resolver.address,
          gas: 3000000
        });
      } catch (error) {
        return utils.ensureException(error);
      }
    });

    it('forbids calls to the fallback function with 1 value', async () => {
      expect.hasAssertions();

      try {
        await web3.eth.sendTransaction({
          from: accounts[0],
          to: resolver.address,
          gas: 3000000,
          value: 1
        });
      } catch (error) {
        return utils.ensureException(error);
      }
    });
  });

  describe('supportsInterface function', async () => {
    it('supports known interfaces', async () => {
      expect(await resolver.supportsInterface('0x3b3b57de')).toBe(
        await resolver.supportsInterface('0x3b3b57de'),
        true
      );
      expect(await resolver.supportsInterface('0x691f3431')).toBe(
        await resolver.supportsInterface('0x691f3431'),
        true
      );
      expect(await resolver.supportsInterface('0x2203ab56')).toBe(
        await resolver.supportsInterface('0x2203ab56'),
        true
      );
      expect(await resolver.supportsInterface('0xc8690233')).toBe(
        await resolver.supportsInterface('0xc8690233'),
        true
      );
      expect(await resolver.supportsInterface('0x59d1d43c')).toBe(
        await resolver.supportsInterface('0x59d1d43c'),
        true
      );
      expect(await resolver.supportsInterface('0xbc1c58d1')).toBe(
        await resolver.supportsInterface('0xbc1c58d1'),
        true
      );
    });

    it('does not support a random interface', async () => {
      expect(await resolver.supportsInterface('0x3b3b57df')).toBe(
        await resolver.supportsInterface('0x3b3b57df'),
        false
      );
    });
  });

  describe('addr', async () => {
    it('permits setting address by owner', async () => {
      await resolver.setAddr(node, accounts[1], fromAccount0);
      expect(await resolver.addr(node)).toBe(
        await resolver.addr(node),
        accounts[1]
      );
    });

    it('can overwrite previously set address', async () => {
      await resolver.setAddr(node, accounts[1], fromAccount0);
      expect(await resolver.addr(node)).toBe(
        await resolver.addr(node),
        accounts[1]
      );

      await resolver.setAddr(node, accounts[0], fromAccount0);
      expect(await resolver.addr(node)).toEqual(accounts[0]);
    });

    it('can overwrite to same address', async () => {
      await resolver.setAddr(node, accounts[1], fromAccount0);
      expect(await resolver.addr(node)).toBe(
        await resolver.addr(node),
        accounts[1]
      );

      await resolver.setAddr(node, accounts[1], fromAccount0);
      expect(await resolver.addr(node)).toBe(
        await resolver.addr(node),
        accounts[1]
      );
    });

    it('forbids setting new address by non-owners', async () => {
      expect.hasAssertions();

      try {
        await resolver.setAddr(node, accounts[1], fromAccount1);
      } catch (error) {
        utils.ensureException(error);
      }
    });

    it('forbids writing same address by non-owners', async () => {
      expect.hasAssertions();
      await resolver.setAddr(node, accounts[1], fromAccount0);

      try {
        await resolver.setAddr(node, accounts[1], fromAccount1);
      } catch (error) {
        utils.ensureException(error);
      }
    });

    it('forbids overwriting existing address by non-owners', async () => {
      expect.hasAssertions();
      await resolver.setAddr(node, accounts[1], fromAccount0);

      try {
        await resolver.setAddr(node, accounts[0], fromAccount1);
      } catch (error) {
        return utils.ensureException(error);
      }
    });

    it('returns zero when fetching nonexistent addresses', async () => {
      expect(await resolver.addr(node)).toBe(
        '0x0000000000000000000000000000000000000000'
      );
    });
  });

  describe('name', async () => {
    it('permits setting name by owner', async () => {
      await resolver.setName(node, 'name1', fromAccount0);
      expect(await resolver.name(node)).toEqual('name1');
    });

    it('can overwrite previously set names', async () => {
      await resolver.setName(node, 'name1', fromAccount0);
      expect(await resolver.name(node)).toEqual('name1');

      await resolver.setName(node, 'name2', fromAccount0);
      expect(await resolver.name(node)).toEqual('name2');
    });

    it('forbids setting name by non-owners', async () => {
      try {
        await resolver.setName(node, 'name2', fromAccount1);
      } catch (error) {
        return utils.ensureException(error);
      }
    });

    it('returns empty when fetching nonexistent name', async () => {
      expect(await resolver.name(node)).toEqual('');
    });
  });

  describe('pubkey', async () => {
    const points = [0, 1, 2, 3, 4].map(point =>
      web3.utils.padRight(web3.utils.numberToHex(point), 64)
    );

    it('returns empty when fetching nonexistent values', async () => {
      assertPubKey(await resolver.pubkey(node), [points[0], points[0]]);
    });

    it('permits setting public key by owner', async () => {
      await resolver.setPubkey(node, points[1], points[2], {
        from: accounts[0]
      });
      assertPubKey(await resolver.pubkey(node), [points[1], points[2]]);
    });

    it('can overwrite previously set value', async () => {
      await resolver.setPubkey(node, points[1], points[2], {
        from: accounts[0]
      });
      await resolver.setPubkey(node, points[3], points[4], {
        from: accounts[0]
      });
      assertPubKey(await resolver.pubkey(node), [points[3], points[4]]);
    });

    it('can overwrite to same value', async () => {
      await resolver.setPubkey(node, points[1], points[2], {
        from: accounts[0]
      });
      await resolver.setPubkey(node, points[1], points[2], {
        from: accounts[0]
      });
      assertPubKey(await resolver.pubkey(node), [points[1], points[2]]);
    });

    it('forbids setting value by non-owners', async () => {
      expect.hasAssertions();

      try {
        await resolver.setPubkey(node, points[1], points[2], {
          from: accounts[1]
        });
      } catch (error) {
        utils.ensureException(error);
      }
    });

    it('forbids writing same value by non-owners', async () => {
      expect.hasAssertions();

      await resolver.setPubkey(node, points[1], points[2], {
        from: accounts[0]
      });

      try {
        await resolver.setPubkey(node, points[1], points[2], {
          from: accounts[1]
        });
      } catch (error) {
        utils.ensureException(error);
      }
    });

    it('forbids overwriting existing value by non-owners', async () => {
      expect.hasAssertions();

      await resolver.setPubkey(node, points[1], points[2], {
        from: accounts[0]
      });

      try {
        await resolver.setPubkey(node, points[3], points[4], {
          from: accounts[1]
        });
      } catch (error) {
        return utils.ensureException(error);
      }
    });
  });

  describe('ABI', async () => {
    const data = web3.utils.asciiToHex('foo');
    const data2 = web3.utils.asciiToHex('bar');
    const emptyData = '0x';

    it('returns a contentType of 0 when nothing is available', async () => {
      const result = await resolver.ABI(node, 0xffffffff);
      expect([result[0].toNumber(), result[1]]).toEqual([0, null]);
    });

    it('returns an ABI after it has been set', async () => {
      await resolver.setABI(node, 0x1, data, fromAccount0);
      const result = await resolver.ABI(node, 0xffffffff);
      expect([result[0].toNumber(), result[1]]).toEqual([1, '0x666f6f']);
    });

    it('returns the first valid ABI', async () => {
      await resolver.setABI(node, 0x2, data, fromAccount0);
      await resolver.setABI(node, 0x4, data2, fromAccount0);

      let result = await resolver.ABI(node, 0x7);
      expect([result[0].toNumber(), result[1]]).toEqual([2, '0x666f6f']);

      result = await resolver.ABI(node, 0x5);
      expect([result[0].toNumber(), result[1]]).toEqual([4, '0x626172']);
    });

    it('allows deleting ABIs', async () => {
      await resolver.setABI(node, 0x1, data, fromAccount0);
      let result = await resolver.ABI(node, 0xffffffff);
      expect([result[0].toNumber(), result[1]]).toEqual([1, '0x666f6f']);

      await resolver.setABI(node, 0x1, emptyData, {
        from: accounts[0]
      });
      result = await resolver.ABI(node, 0xffffffff);
      expect([result[0].toNumber(), result[1]]).toEqual([0, null]);
    });

    it('rejects invalid content types', async () => {
      expect.hasAssertions();

      try {
        await resolver.setABI(node, 0x3, data, fromAccount0);
      } catch (error) {
        return utils.ensureException(error);
      }
    });

    it('forbids setting value by non-owners', async () => {
      expect.hasAssertions();

      try {
        await resolver.setABI(node, 0x1, data, fromAccount1);
      } catch (error) {
        return utils.ensureException(error);
      }
    });
  });

  describe('text', async () => {
    const url = 'https://ethereum.org';
    const url2 = 'https://github.com/ethereum';

    it('permits setting text by owner', async () => {
      await resolver.setText(node, 'url', url, fromAccount0);
      expect(await resolver.text(node, 'url')).toBe(
        await resolver.text(node, 'url'),
        url
      );
    });

    it('can overwrite previously set text', async () => {
      await resolver.setText(node, 'url', url, fromAccount0);
      expect(await resolver.text(node, 'url')).toBe(
        await resolver.text(node, 'url'),
        url
      );

      await resolver.setText(node, 'url', url2, fromAccount0);
      expect(await resolver.text(node, 'url')).toBe(
        await resolver.text(node, 'url'),
        url2
      );
    });

    it('can overwrite to same text', async () => {
      await resolver.setText(node, 'url', url, fromAccount0);
      expect(await resolver.text(node, 'url')).toBe(
        await resolver.text(node, 'url'),
        url
      );

      await resolver.setText(node, 'url', url, fromAccount0);
      expect(await resolver.text(node, 'url')).toBe(
        await resolver.text(node, 'url'),
        url
      );
    });

    it('forbids setting new text by non-owners', async () => {
      expect.hasAssertions();

      try {
        await resolver.setText(node, 'url', url, fromAccount1);
      } catch (error) {
        return utils.ensureException(error);
      }
    });

    it('forbids writing same text by non-owners', async () => {
      expect.hasAssertions();

      await resolver.setText(node, 'url', url, fromAccount0);

      try {
        await resolver.setText(node, 'url', url, fromAccount1);
      } catch (error) {
        return utils.ensureException(error);
      }
    });
  });

  describe('contentHash', () => {
    it('forbids setting contenthash ', async () => {
      expect.hasAssertions();

      try {
        await resolver.setContenthash(
          node,
          '0x0000000000000000000000000000000000000000000000000000000000000001',
          fromAccount0
        );
      } catch (error) {
        return utils.ensureException(error);
      }
    });
  });

  describe('revisions', async () => {
    const contentHash1 = web3.utils.asciiToHex(
      '/ipfs/QM00000000000000000000000000000000000000000000000000000000000001'
    );
    const contentHash2 = web3.utils.asciiToHex(
      '/ipfs/QM00000000000000000000000000000000000000000000000000000000000002'
    );

    it('permits publishing revisions by owner', async () => {
      await resolver.publishRevision(node, contentHash1, fromAccount0);

      expect(await resolver.contenthash(node)).toBe(contentHash1);
    });

    it('can add a new revision', async () => {
      await resolver.publishRevision(node, contentHash1, fromAccount0);
      expect(await resolver.contenthash(node)).toBe(contentHash1);

      await resolver.publishRevision(node, contentHash2, fromAccount0);
      expect(await resolver.contenthash(node)).toBe(contentHash2);
    });

    it('can publish new revision with same contenthash', async () => {
      await resolver.publishRevision(node, contentHash1, fromAccount0);
      expect(await resolver.contenthash(node)).toBe(contentHash1);

      await resolver.publishRevision(node, contentHash2, fromAccount0);
      expect(await resolver.contenthash(node)).toBe(contentHash2);
    });

    it('forbids publishing new revision by non-owners', async () => {
      expect.hasAssertions();

      try {
        await resolver.publishRevision(node, contentHash1, fromAccount1);
      } catch (error) {
        return utils.ensureException(error);
      }
    });

    it('forbids publishing same contenthash by non-owners', async () => {
      expect.hasAssertions();

      await resolver.publishRevision(node, contentHash1, fromAccount0);

      try {
        await resolver.publishRevision(node, contentHash1, fromAccount1);
      } catch (error) {
        return utils.ensureException(error);
      }
    });

    it('returns null when fetching nonexistent contenthash', async () => {
      expect(await resolver.contenthash(node)).toBe(null);
    });

    it('can perform a blue/green deploy', async () => {
      await resolver.setDefaultAlias(node, 'green');

      await resolver.publishRevision(node, contentHash1, fromAccount0);
      expect(await resolver.contenthash(node)).toBe(contentHash1);

      await resolver.publishRevision(node, contentHash2, 'blue', fromAccount0);

      expect(await resolver.contenthash(node)).toBe(contentHash1);

      // You would run integration tests here
      // Note: currently "difficult" due to
      //   https://github.com/ConsenSys/web3studio-soy/issues/14

      await resolver.setRevisionAlias(node, 1, 'green');
      expect(await resolver.contenthash(node)).toBe(contentHash2);
    });
  });
});
