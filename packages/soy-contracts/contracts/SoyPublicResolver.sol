pragma solidity ^0.4.18;

import "@ensdomains/ens/contracts/ENS.sol";
import "@ensdomains/resolver/contracts/PublicResolver.sol";

/**
 * A simple resolver anyone can use; only allows the owner of a node can set its
 * address.
 */
contract SoyPublicResolver is PublicResolver {
  /**
   * Constructor.
   * @param ensAddr The ENS registrar contract.
   */
  constructor(ENS ensAddr) PublicResolver(ensAddr) public {}
}
