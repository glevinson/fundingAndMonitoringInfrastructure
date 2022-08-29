// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.7;

// For Remix Deployment:
//*****************************************************************************
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
//*****************************************************************************

// For truffle deployment:
// import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
// import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
// import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
// import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol";

abstract contract IERC20Extented is IERC20 {
    function decimals() public view virtual returns (uint8);
}

contract Fundraising is ERC20 {
    IERC20Extented public coin; // The ERC-20 coin that admin has decided to raise funds in
    IERC721 public immutable projectMarketplace; // ProjectMarketplace contract that has created this Fundraising contract
    uint256 public targetAmount;
    uint256 public amountRaised;
    uint256 public dataAccessThreshold; // Minimum number of ERC20 tokens required to access the corresponding projects data
    bool public paused = false; 
    bool public killed = false;
    address admin;

    constructor(uint256 amount, string memory name, string memory symbol, uint256 _dataAccessThreshold, address _admin, address coinAddress) ERC20(name, symbol) {
        targetAmount = amount;
        dataAccessThreshold = _dataAccessThreshold;
        admin = _admin;
        coin = IERC20Extented(coinAddress);
        projectMarketplace = IERC721(msg.sender);
    }

    function decimals() public view virtual override returns (uint8) {
        return coin.decimals();
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
        if (!paused){
            paused = true;
        }
        else{
            paused = false;
        }
    }

    function kill() onlyOwner external {
        killed = true;
    }

    function amountUntilReachTarget() public view returns (uint256){
        return (targetAmount - amountRaised) ;
    }

    /* User's can invest if conditions satisfied */
    function invest(uint256 value) external {
        require( totalSupply() < targetAmount, "Target Already Raised" );
        require(value <= targetAmount - totalSupply(), "Not enough shares left!");
        require( !paused, "Contract Is Paused" );
        require( !killed, "Contract Is Killed");

        coin.transferFrom(msg.sender, address(this), value);
        amountRaised += value;
        _mint(msg.sender, value);

        if (targetAmount == totalSupply()) { 
            coin.transfer(admin, targetAmount);
        }
    }

    /* Users can withdraw up to their net investment if the target has not already been raised yet */
    function withdrawInvestment(uint256 value) external {
        require( totalSupply() < targetAmount , "Target Already Raised" );
        require(value <= balanceOf(msg.sender), "Not Great Enough Balance!");
        amountRaised -= value;
        _burn(msg.sender, value);
    }

    /* If a user has invested the full target amount, they can redeem their RFT supply for the project's NFT */
    function redeemNFT() external {
        require( balanceOf(msg.sender) == targetAmount, "Do Not Have RFT Total Supply" );
        _burn(msg.sender, totalSupply() );
        projectMarketplace.safeTransferFrom( address(this), msg.sender, uint256(uint160(address(this))));
    }
}

//References:
// The interface IERC20Extended is from: // https://ethereum.stackexchange.com/questions/84095/how-to-get-the-decimals-of-erc20-token-in-smart-contract
