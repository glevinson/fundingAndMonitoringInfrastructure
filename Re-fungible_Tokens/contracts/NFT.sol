// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

// Majority of this lifted from: https://github.com/jklepatch/eattheblocks/blob/b9318560a7358847193ef5959c38c967999c7a71/screencast/241-re-fungible-tokens/contracts/NFT.sol
//***********************************************************************************************************************
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

contract NFT is ERC721 {
  constructor(
    string memory name, 
    string memory symbol
  ) 
  ERC721(name, symbol) 
  {}

  function mint(address to, uint tokenId) external {
    _mint(to, tokenId);
  }
}
//***********************************************************************************************************************