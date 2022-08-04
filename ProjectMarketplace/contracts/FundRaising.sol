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
    uint256 public amountRaised;
    uint256 public dataAccessThreshold; // The minimum number of ERC20 tokens required to access the corresponding projects data
    bool public _paused; // = false by default
    bool public istargetRaised;
    address admin;

    constructor(uint256 amount, string memory name, string memory symbol, uint256 _dataAccessThreshold, address _admin, address daiAddress) ERC20(name, symbol) {
        targetAmount = amount;
        dataAccessThreshold = _dataAccessThreshold;
        admin = _admin;
        DAI = IERC20(daiAddress);
        NFT = IERC721(msg.sender);
    }

    modifier onlyOwner(){
            require(msg.sender == admin, "Only Admin Can Pause/Unpause");
            _;
    }

    // Enables this contract to recieve ERC-721 token
    function onERC721Received(address /*operator*/, address /*from*/, uint256 /*tokenId*/, bytes calldata /*data*/) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function pause() onlyOwner external {
        _paused = true;
    }

    function unpause() onlyOwner external{
        _paused = false;
    }

    function amountUntilReachTarget() public view returns (uint256){
        return (targetAmount - amountRaised) ;
    }

    function invest(uint256 value) external {
        require( !istargetRaised, "Target Already Raised" );
        require(value <= targetAmount - totalSupply(), "Not enough shares left!");
        require( !_paused, "Contract Is Paused" );

        DAI.transferFrom(msg.sender, address(this), value);
        amountRaised += value;
        _mint(msg.sender, value);

        if (targetAmount == totalSupply()) { 
            DAI.transfer(admin, targetAmount); // How deal with this money
            istargetRaised = true; // QUESTION: Should I burn their ERC-20 tokens too? & HOW BEST TO TEST THIS?
            // if ( balanceOf(msg.sender) == targetAmount ){ 
            //     NFT.safeTransferFrom( address(this), msg.sender, uint256(uint160(address(this))));
            // }
        }
    }

    function withdrawInvestment(uint256 value) external {
        require( !istargetRaised, "Target Already Raised" );
        require(value <= balanceOf(msg.sender), "Not Great Enough Balance!"); // As DAI instatneously removed when targetRaised, this require should also cover that s
        DAI.transfer(msg.sender, value);
        amountRaised -= value;
        _burn(msg.sender, value);
    }

    /* If a user has invested the full target amount, they can redeem their RFT supply for the project's NFT*/
    function redeemNFT() external {
        require( balanceOf(msg.sender) == targetAmount, "Do Not Have RFT Supply" );
        _burn(msg.sender, totalSupply() );
        NFT.safeTransferFrom( address(this), msg.sender, uint256(uint160(address(this))));
    }

}

// Unit tests:

// Invest:

// CanInvestIfContracUnpausedAndEnoughShares
// When the contract is activated
    // when value <= number shares left
        // When the contract is NOT paused
            // balanceOf DAI should be += value
            // Donor should recieve correspodning ERC-20 tokens