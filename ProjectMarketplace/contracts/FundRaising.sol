// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.7;

// For Remix Deployment:
//********************************************************************************************************************************************************** */
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
//********************************************************************************************************************************************************** */

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol";


contract Fundraising is ERC20 {
    IERC20 public coin; // The ERC-20 coin that admin has decided to raise funds in
    IERC721 public immutable projectMarketplace; // ProjectMarketplace contract that has created this Fundraising contract
    uint256 public targetAmount;
    uint256 public amountRaised;
    uint256 public dataAccessThreshold; // Minimum number of ERC20 tokens required to access the corresponding projects data
    bool public _paused = false; 
    bool public istargetRaised = false;
    address admin;

    constructor(uint256 amount, string memory name, string memory symbol, uint256 _dataAccessThreshold, address _admin, address coinAddress) ERC20(name, symbol) {
        targetAmount = amount;
        dataAccessThreshold = _dataAccessThreshold;
        admin = _admin;
        coin = IERC20(coinAddress);
        projectMarketplace = IERC721(msg.sender);
    }

    modifier onlyOwner(){
            require(msg.sender == admin, "Only Admin Can Pause/Unpause");
            _;
    }

    /* Enables this contract to recieve the project ERC-721 token */
    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
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

    /* User's can invest if the specified investment */
    function invest(uint256 value) external {
        require( !istargetRaised, "Target Already Raised" );
        require(value <= targetAmount - totalSupply(), "Not enough shares left!");
        require( !_paused, "Contract Is Paused" );

        coin.transferFrom(msg.sender, address(this), value);
        amountRaised += value;
        _mint(msg.sender, value);

        if (targetAmount == totalSupply()) { 
            coin.transfer(admin, targetAmount);
            istargetRaised = true;
        }
    }

    /* Investor's can withdraw their investment if the target has not already been raised yet*/
    function withdrawInvestment(uint256 value) external {
        require( !istargetRaised, "Target Already Raised" );
        require(value <= balanceOf(msg.sender), "Not Great Enough Balance!"); // As DAI instatneously removed when targetRaised, this require should also cover that s
        coin.transfer(msg.sender, value);
        amountRaised -= value;
        _burn(msg.sender, value);
    }

    /* If a user has invested the full target amount, they can redeem their RFT supply for the project's NFT*/
    function redeemNFT() external {
        require( balanceOf(msg.sender) == targetAmount, "Do Not Have RFT Total Supply" );
        _burn(msg.sender, totalSupply() );
        projectMarketplace.safeTransferFrom( address(this), msg.sender, uint256(uint160(address(this))));
    }
}