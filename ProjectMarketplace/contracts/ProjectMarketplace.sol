// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.7;

// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./FundRaising.sol";

// The terms "project" and "projectMarketPlace" are synonymous
contract ProjectMarketPlace is  ERC721Enumerable {
    string public baseURI;

    constructor(string memory springDAOMetadataURI) ERC721("The Sping DAO Project Marketplace Test", "SpringDAOtest") {
        baseURI = springDAOMetadataURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function createProject(uint256 targetAmount, string calldata projectName, string calldata projectSymbol, address testDAI) external {
        address newProjectAddress = address(new FundRaising(targetAmount, projectName, projectSymbol, msg.sender, testDAI));
        _safeMint( newProjectAddress , uint256(uint160(newProjectAddress))); // think should transfer ownership to the projectfundraising contract
    }

    function findprojectContract( uint256 tokenID ) public pure returns ( address ){
        return address(uint160(tokenID));
    }
}