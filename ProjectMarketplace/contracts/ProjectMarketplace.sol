// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.7;

// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./FundRaising.sol";

// The terms "project" and "projectMarketPlace" are synonymous
contract ProjectMarketPlace is  ERC721Enumerable {
    // string public baseURI;
    mapping(uint256 => string ) public idToTokenURI;

    constructor() ERC721("The Sping DAO Project Marketplace Test", "SpringDAOtest") {
        // baseURI = springDAOMetadataURI;
    }

    // Can delete this : 
    // function _baseURI() internal view override returns (string memory) {
    //     return baseURI;
    // }

    function createProject(uint256 targetAmount, string calldata projectName, string calldata projectSymbol, string calldata _tokenURI, address DAI) external returns (uint256) {
        address newProjectAddress = address(new FundRaising(targetAmount, projectName, projectSymbol, msg.sender, DAI));
        uint256 tokenID = uint256(uint160(newProjectAddress));
        _safeMint( newProjectAddress , tokenID ); // think should transfer ownership to the projectfundraising contract
        idToTokenURI[tokenID] = _tokenURI; 
        return tokenID;
    }

    function tokenURI( uint256 tokenID ) public view virtual override returns (string memory){
        return idToTokenURI[tokenID];
    }

    function findprojectContract( uint256 tokenID ) public pure returns ( address ){
        return address(uint160(tokenID));
    }
}