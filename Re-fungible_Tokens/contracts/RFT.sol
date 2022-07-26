// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract FundRaising is ERC20 {
    IERC20 public constant DAI = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);
    IERC721 public immutable NFT; // The NFT that creates the FundRaisingCampaigns
    uint256 public targetAmount; // Target amount for the fundraising

    constructor(uint256 amount, string memory name, string memory symbol) ERC20(name, symbol) {
        targetAmount = amount;
        NFT = IERC721(msg.sender);
    }

    function invest(uint256 value) external {
        require(value <= targetAmount - totalSupply(), "Not enough shares left!");
        DAI.transferFrom(msg.sender, address(this), value);
        _mint(msg.sender, value);
        if (targetAmount == totalSupply()) { 
            DAI.transfer(NFT.ownerOf(uint256(uint160(address(this)))), targetAmount); 
        }
    }

    function withdrawInvestment(uint256 value) external {
        require(value <= balanceOf(msg.sender), "Not enough shares balance!");
        DAI.transfer(msg.sender, value);
        _burn(msg.sender, value);
    }
}


contract FundRaisingMarketPlace is ERC721Enumerable {
    string public baseURI; 

    constructor(string memory springDaoMetadataURI) ERC721("Spring Dao Project Marketplace", "SpringDAO") {
        baseURI = springDaoMetadataURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

}