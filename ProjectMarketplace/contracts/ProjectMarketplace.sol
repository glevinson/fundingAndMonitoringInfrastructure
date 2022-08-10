// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.7;

// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./Fundraising.sol";

// The terms "project" and "projectMarketPlace" are synonymous
contract ProjectMarketplace is  ERC721Enumerable {
    mapping(uint256 => string ) public idToTokenURI;

    constructor() ERC721("The Sping DAO Project Marketplace Test", "SpringDAOtest") {}

    function createProject(uint256 targetAmount, string calldata projectName, string calldata projectSymbol, string calldata _tokenURI, uint256 dataAccessThreshold, address DAI) external returns (uint256) {
        address newProjectAddress = address(new Fundraising(targetAmount, projectName, projectSymbol, dataAccessThreshold, msg.sender, DAI));
        uint256 tokenID = uint256(uint160(newProjectAddress));
        _safeMint( newProjectAddress , tokenID ); // think should transfer ownership to the projectfundraising contract
        idToTokenURI[tokenID] = _tokenURI; 
        return tokenID;
    }

    function tokenURI( uint256 tokenID ) public view virtual override returns (string memory){
        return idToTokenURI[tokenID];
    }

    function findProjectFundraise( uint256 tokenID ) public pure returns ( address ){
        return address(uint160(tokenID));
    }
}