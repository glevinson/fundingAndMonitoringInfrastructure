// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

// Majority of this lifted from: https://github.com/jklepatch/eattheblocks/blob/b9318560a7358847193ef5959c38c967999c7a71/screencast/241-re-fungible-tokens/contracts/RFT.sol
//*****************************************************************************************************************
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract RFT is ERC20 {
  //ICO & shares
  uint public SharePrice;
  uint public ShareSupply;
  uint public icoEnd;
  uint public Target;

  //NFT & DAI
  uint public nftId;
  IERC721 public nft;
  IERC20 public dai;

  //other
  address public admin;
  bool public TargetRaised = false;

  // Mappings to keep track of investors:
  mapping(address => uint256) public addressToAmountFunded; // So can process refunds

  constructor(
    string memory _name,
    string memory _symbol,
    address _nftAddress, 
    uint _nftId,
    uint _SharePrice,
    uint _ShareSupply,
    address _daiAddress
  ) 
  ERC20(_name, _symbol) 
  {
    nftId = _nftId;
    nft = IERC721(_nftAddress);
    SharePrice = _SharePrice; 
    ShareSupply = _ShareSupply;
    dai = IERC20(_daiAddress);
    admin = msg.sender;

    Target = (ShareSupply * SharePrice);
  }

  // DONT THINK NEED A START OR A END TO NECCESSARILY BE SPECIFIED
  function startIco() external {
    require(msg.sender == admin, 'only admin');
    nft.transferFrom(msg.sender, address(this), nftId);
    icoEnd = block.timestamp + 7 * 86400;
  }

  function buyShare(uint shareAmount) external {
    require(icoEnd > 0, 'ICO not started yet');
    require(block.timestamp <= icoEnd, 'ICO is finished');
    require(totalSupply() + shareAmount <= ShareSupply, 'not enough shares left');
    uint daiAmount = shareAmount * SharePrice;
    dai.transferFrom(msg.sender, address(this), daiAmount);

    // This minting should be saved for later
    _mint(msg.sender, shareAmount);
  }

  function withdrawIcoProfits() external {
    require(msg.sender == admin, 'only admin');
    require(block.timestamp > icoEnd, 'ICO not finished yet'); 
    uint daiBalance = dai.balanceOf(address(this));
    if(daiBalance > 0) {
      dai.transfer(admin, daiBalance);
    }
    uint unsoldShareBalance = ShareSupply - totalSupply();
    if(unsoldShareBalance > 0) {
      _mint(admin, unsoldShareBalance);
    }
  }
}