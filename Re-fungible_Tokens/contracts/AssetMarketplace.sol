// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./AssetFundRaising.sol";

// The terms "project" and "AssetMarketPlace" are synonymous
contract AssetMarketPlace is ERC721Enumerable {
    string public baseURI; 

    constructor(string memory projectName, string memory projectSymbol, string memory assetMetadataURI) ERC721(projectName , projectSymbol) {
        baseURI = assetMetadataURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function addAsset(uint256 targetAmount, string calldata assetName, string calldata assetSymbol, address daiAddress) external {
        address newAssetAddress = address(new AssetFundRaising(targetAmount, assetName, assetSymbol, daiAddress));
        _safeMint(msg.sender, uint256(uint160(newAssetAddress))); // think should transfer ownership to the Assetfundraising contract
    }

    function findAssetContract( uint256 tokenID ) public pure returns ( address ){
        return address(uint160(tokenID));
    }
}