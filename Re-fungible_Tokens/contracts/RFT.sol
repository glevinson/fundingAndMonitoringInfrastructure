// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

// A lot of this referenced from: https://github.com/jklepatch/eattheblocks/blob/b9318560a7358847193ef5959c38c967999c7a71/screencast/241-re-fungible-tokens/contracts/RFT.sol
//*****************************************************************************************************************
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract RFT is ERC20 {
  //ICO & shares
  uint public SharePrice;
  uint public ShareSupply;

  // DONT THINK NEED THIS BIT:
  uint public icoEnd;
  // ^^

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
  address[] public addresses;

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
  // function startIco() external {
  //   require(msg.sender == admin, 'only admin');
  //   nft.transferFrom(msg.sender, address(this), nftId);
  //   icoEnd = block.timestamp + 7 * 86400;
  // }

  function startRaise() external {
    require(msg.sender == admin, 'only admin');
    nft.transferFrom(msg.sender, address(this), nftId);
    // icoEnd = block.timestamp + 7 * 86400;
  }

  function buyShare(uint shareAmount) external {

    // DONT THINK NEED THIS BIT:
    // require(icoEnd > 0, 'ICO not started yet');
    // require(block.timestamp <= icoEnd, 'ICO is finished');
    // ^^

    require(totalSupply() + shareAmount <= ShareSupply, 'not enough shares left');
    require( !TargetRaised , 'all shares sold');

    uint daiAmount = shareAmount * SharePrice;
    dai.transferFrom(msg.sender, address(this), daiAmount);

    // Adding callee and amount of dai sent to map
    addressToAmountFunded[msg.sender] += daiAmount;
    addresses.push(msg.sender);

    if ( totalSupply() == ShareSupply ){
      TargetRaised = true;
      disburseTokens();
      withdraw();
    }

  }

  // function refund() external{
  //   // All keys are initiallised set to 0
  //   require( addressToAmountFunded[msg.sender] > 0, 'No balance to refund' );
    
  //   uint amount = addressToAmountFunded[msg.sender];
  //   addressToAmountFunded[msg.sender] = 0;
  //   dai.transfer(msg.sender, amount);
  // }

  // NB: May want to change private access modifier to internal, just important that no one can call this; 
  // i.e. only contract
  function withdraw() private {
    require(msg.sender == admin, 'only admin');

    uint daiBalance = dai.balanceOf(address(this));

    assert( daiBalance == Target );

    dai.transfer(admin, daiBalance);

    // DONT THINK NEED THIS BIT:
    // require(block.timestamp > icoEnd, 'ICO not finished yet'); 
    // ^^

    // if(daiBalance > 0) {
    //   dai.transfer(admin, daiBalance);
    // }
    // uint unsoldShareBalance = ShareSupply - totalSupply();
    // if(unsoldShareBalance > 0) {
    //   _mint(admin, unsoldShareBalance);
    // }
  }

//************************************************************************************************************************ */

    function refund( uint amount ) external{
    // All keys are initiallised set to 0
    require( addressToAmountFunded[msg.sender] > 0, 'No balance to refund' );
    require( amount <= addressToAmountFunded[msg.sender], 'Amount greater than balance' );
    require( ( amount % SharePrice ) == 0, 'Can only refund whole shares (multiples of the share price)' );
    
    addressToAmountFunded[msg.sender] -= amount;
    dai.transfer(msg.sender, amount);
  }

  // This function should disburse Tokens according to donations...
  function disburseTokens() private{
    // Iterate through the addresses
    for (uint i = 0; i < addresses.length; i++){
      // The amount of tokens each donor is entitled to is the amount they have invested / the cost of each share (token)
      uint amountTokens = ( addressToAmountFunded[ addresses[i] ] ) / SharePrice;

      if ( amountTokens == ShareSupply ){
        nft.transferFrom(address(this), addresses[i] , nftId);
        return;
      }
      // Now set amount funded to 0 to prevent users recieving tokens and calling refund after
      addressToAmountFunded[addresses[i]] = 0;
      _mint( addresses[i] , amountTokens);
    }
  }    // This minting should be saved for later
}