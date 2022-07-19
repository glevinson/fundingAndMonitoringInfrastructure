// SPDX-License-Identifier: MIT

// Referenced from: https://github.com/PatrickAlphaC/nft-mix/blob/main/contracts/SimpleCollectible.sol
//************************************************************************************************************************ */
pragma solidity ^0.8.0;

import "./ERC-721/ERC721.sol";

contract InfrastructureNFT is ERC721{
    uint256 public tokenCounter;
    constructor () ERC721 ("Infrastructure", "INFRA"){
        tokenCounter = 0;
    }

    function createCollectible(address account, string memory tokenURI) public returns (uint256) {
        uint256 newItemId = tokenCounter;
        _safeMint(account, newItemId);
        _setTokenURI(newItemId, tokenURI);
        tokenCounter = tokenCounter + 1;
        return newItemId;
    }

}
//************************************************************************************************************************ */