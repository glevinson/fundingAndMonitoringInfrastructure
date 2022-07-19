// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
// import "@chainlink/contracts/src/v0.6/vendor/SafeMathChainlink.sol";

// Below referenced from [1]
//**************************************************************************************************** */

contract fundraise {
    // using SafeMathChainlink for uint256;
    
    mapping(address => uint256) public addressToAmountFunded;
    address[] public funders;
    address public owner;
    AggregatorV3Interface internal ethFeed;
    
    constructor() {
        owner = msg.sender;
        ethFeed = AggregatorV3Interface(0x9326BFA02ADD2366b30bacB125260Af641031331);
    }
    
    function fund() public payable {
        uint256 minimumUSD = 50 * 10 ** 18;
        require(getConversionRate(msg.value) >= minimumUSD, "You need to spend more ETH!");
        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);
    }
    
    function getConversionRate(uint256 ethAmount) public view returns (uint256) {
        uint256 ethPrice = getPrice();
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1000000000000000000;
        return ethAmountInUsd;
    }
    
    // function getPrice() public view returns(uint256) {
    //     AggregatorV3Interface priceFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
    //     (
    //       ,
    //       int256 answer,
    //       ,
    //       ,
    //     ) = priceFeed.latestRoundData();
    //     return uint256(answer * 10000000000);
    // }

        /**
     * Returns the latest price
     */
    function getPrice() public view returns (uint256) {
        (
            uint80 roundID,
            int256 price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = ethFeed.latestRoundData();
        return uint256(price)
        ;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    function withdraw() payable onlyOwner public {
        payable(msg.sender).transfer(address(this).balance);
        
        for (uint256 i=0; i < funders.length; i++) {
            address funder = funders[i];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);
    }   

    // function balance() public view returns (uint){
    //     return address(this).balance;
    // }

//**************************************************************************************************** */
    
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
// References:
// [1]: https://chowdera.com/2021/12/202112241431013471.html
