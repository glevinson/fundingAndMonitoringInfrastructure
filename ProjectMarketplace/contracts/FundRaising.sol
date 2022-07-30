// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.7;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol";


contract FundRaising is ERC20 {
    // IERC20 public constant DAI = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F); <= Actual DAI address
    IERC20 public DAI;
    IERC721 public immutable NFT; // The NFT that creates the FundRaisingCampaigns
    uint256 public targetAmount; // Target amount for the fundraising
    bool public _paused; // = false by default
    address admin;

    constructor(uint256 amount, string memory name, string memory symbol, address _admin, address daiAddress) ERC20(name, symbol) {
        targetAmount = amount;
        admin = _admin;
        DAI = IERC20(daiAddress);
        NFT = IERC721(msg.sender);
    }

    modifier onlyOwner(){
            require(msg.sender == admin);
            _;
    }

    // Enables this contract to recieve ERC-721 token
    function onERC721Received(address /*operator*/, address /*from*/, uint256 /*tokenId*/, bytes calldata /*data*/) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function invest(uint256 value) external {
        require(value <= targetAmount - totalSupply(), "Not enough shares left!");
        require( !_paused, "Paused" );
        DAI.transferFrom(msg.sender, address(this), value);
        _mint(msg.sender, value);
        if (targetAmount == totalSupply()) { 
            DAI.transfer(admin, targetAmount); // How deal with this money
        }
    }

    function withdrawInvestment(uint256 value) external {
        require(value <= balanceOf(msg.sender), "Not enough shares balance!");
        DAI.transfer(msg.sender, value);
        _burn(msg.sender, value);
    }

    function pause() onlyOwner external {
        _paused = true;
    }

    function unpause() onlyOwner external{
        _paused = false;
    }
}