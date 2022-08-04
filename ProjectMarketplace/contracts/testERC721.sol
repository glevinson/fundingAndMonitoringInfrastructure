// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.7;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./FundRaising.sol";

contract testERC721 is  ERC721Enumerable {

    constructor() ERC721("The Sping DAO Project Marketplace Test", "SpringDAOtest") {
        // baseURI = springDAOMetadataURI;
    }

    function createProject(uint256 targetAmount, string calldata projectName, string calldata projectSymbol, string calldata _tokenURI, uint256 dataAccessThreshold, address DAI) external returns (address) {
        address newProjectAddress = address(new FundRaising(targetAmount, projectName, projectSymbol, dataAccessThreshold, msg.sender, DAI));
        uint256 tokenID = uint256(uint160(newProjectAddress));
        _safeMint( newProjectAddress , tokenID ); // think should transfer ownership to the projectfundraising contract
        return newProjectAddress;
    }
}
