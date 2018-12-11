pragma solidity ^0.4.18;

import "@ensdomains/ens/contracts/ENS.sol";
import "@ensdomains/resolver/contracts/PublicResolver.sol";

/**
 * A simple resolver anyone can use; only allows the owner of a node can set its
 * address.
 */
contract SoyPublicResolver is PublicResolver {

  event DefaultAliasChanged(bytes32 indexed defaultAlias, string name);
  event RevisionPublished(bytes32 indexed node, bytes hash);

  struct SoyRecord {
    string defaultAlias;
    mapping(string=>uint256) aliases;
    bytes[] revs;
  }

  mapping (bytes32 => SoyRecord) soyRecords;

  /**
   * Constructor.
   *
   * @param ensAddr The ENS registrar contract.
   */
  constructor(ENS ensAddr) PublicResolver(ensAddr) public {}

  /**
   * Sets the default alias associated with an ENS node.
   * May only be called by the owner of that node in the ENS registry.
   *
   * @param node The node to update.
   * @param defaultAlias The default alias to set.
   */
  function setDefaultAlias(bytes32 node, string defaultAlias) public onlyOwner(node) {
    soyRecords[node].defaultAlias = defaultAlias;
    emit DefaultAliasChanged(node, defaultAlias);
  }

  /**
   * Returns the default alias associated with an ENS node.
   *
   * @param node The ENS node to query.
   * @return The associated default alias.
   */
  function defaultAlias(bytes32 node) public view returns (string) {
    string storage recordDefaultAlias = soyRecords[node].defaultAlias;

    return bytes(recordDefaultAlias).length > 0 ? recordDefaultAlias : "latest";
  }

  /**
   * Sets the revision alias with an ENS node.
   * May only be called by the owner of that node in the ENS registry.
   *
   * @param node The node to update.
   * @param revNumber The revision number to set an alias to
   * @param alias The alias to set.
   */
  function setRevisionAlias(bytes32 node, uint256 revNumber, string alias) public onlyOwner(node) {
    soyRecords[node].aliases[alias] = revNumber;
  }

  /**
   * Publishes a new hash revision associated with an ENS node.
   * May only be called by the owner of that node in the ENS registry.
   *
   * @param node The node to update.
   * @param hash The contenthash to set
   * @return the revision number published
   */
  function publishRevision(bytes32 node, bytes hash) public onlyOwner(node) returns(uint256) {
    return publishRevision(node, hash, defaultAlias(node));
  }

  /**
   * Publishes a new hash revision associated with an ENS node.
   * May only be called by the owner of that node in the ENS registry.
   *
   * @param node The node to update.
   * @param hash The contenthash to set
   * @param alias The alias to set to new revision
   * @return the revision number published
   */
  function publishRevision(bytes32 node, bytes hash, string alias) public onlyOwner(node) returns(uint256) {
    SoyRecord storage record = soyRecords[node];

    uint256 revNumber = record.revs.push(hash) - 1;
    setRevisionAlias(node, revNumber, alias);

    emit RevisionPublished(node, hash);

    return revNumber;
  }

  /**
   * Override base contract implementation
   *
   * @param node The node to update.
   * @param hash The contenthash to set
   */
  function setContenthash(bytes32 node, bytes hash) public onlyOwner(node) {
    revert("Unable to set content hash directly. Use `publishRevision` instead");
  }

  /**
   * Returns the contenthash associated with the revision set by the defaultAlias
   *
   * @param node The ENS node to query.
   * @return The associated contenthash.
   */
  function contenthash(bytes32 node) public view returns (bytes) {
    bytes memory empty;
    SoyRecord storage record = soyRecords[node];
    uint256 rev = record.aliases[defaultAlias(node)];

    return record.revs.length > 0 ? record.revs[rev] : empty;
  }
}
