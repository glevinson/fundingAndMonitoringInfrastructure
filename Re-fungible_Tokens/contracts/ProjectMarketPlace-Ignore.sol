// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./AssetMarketPlace.sol";

contract ProjectMarketPlace is ERC721Enumerable {
    string public baseURI; 

    constructor(string memory projectMetadataURI) ERC721("Spring Dao Project Marketplace", "SpringDAO") {
        baseURI = projectMetadataURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function newProject(string calldata projectName, string calldata projectSymbol, string calldata assetMetadataURI) external {
        address newProjectAddress = address(new AssetMarketPlace( projectName, projectSymbol, assetMetadataURI));
        _safeMint(msg.sender, uint256(uint160(newProjectAddress)));
    }

    function findProjectContract( uint256 tokenID ) public pure returns ( address ){
        return address(uint160(tokenID));
    }
}

// There's no point on spending gas on deploying this if the only useful function is newProject which just deploys
// AssetMarketPlace anyway. We can have script functions called "createProject" that deploys AssetMarketplace and 
// Then the scripts can add assets as they always would have had to