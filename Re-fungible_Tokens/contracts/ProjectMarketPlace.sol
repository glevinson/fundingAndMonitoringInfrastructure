// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "./AssetFundRaising.sol";

// The terms "project" and "AssetMarketPlace" are synonymous
contract ProjectMarketPlace is  ERC721Enumerable {
    string public baseURI;
    uint256 totalTarget;
    address admin;

    constructor(string memory projectName, string memory projectSymbol, string memory projectMetadataURI) ERC721(projectName , projectSymbol) {
        baseURI = projectMetadataURI;
        admin = msg.sender;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function addAsset(uint256 targetAmount, string calldata assetName, string calldata assetSymbol, address testDAI) external {
        require( msg.sender == admin, "Only Admin Can Add Assets" );
        address newAssetAddress = address(new AssetFundRaising(targetAmount, assetName, assetSymbol, admin, testDAI));
        totalTarget += targetAmount;
        _safeMint(msg.sender, uint256(uint160(newAssetAddress))); // think should transfer ownership to the Assetfundraising contract
    }

    function findAssetContract( uint256 tokenID ) public pure returns ( address ){
        return address(uint160(tokenID));
    }

    function changeTarget( bool paused, uint256 amount ){
        if ( paused ){
            totalTarget -= amount;
        }
        else{
            totalTarget += amount;
        }
        but then have to get assetFundRaising to trigger this 
    }

    function pauseAsset( uint tokenID ){

    }
}