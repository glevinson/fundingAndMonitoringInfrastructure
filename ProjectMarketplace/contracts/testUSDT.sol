// SPDX-License-Identifier: MIT
// THIS IS A MOCK DAI STABLECOIN
// Majority of this lifted from: https://github.com/jklepatch/eattheblocks/blob/b9318560a7358847193ef5959c38c967999c7a71/screencast/241-re-fungible-tokens/contracts/DAI.sol
//*****************************************************************************************************************
pragma solidity ^0.8;

// import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract testUSDT is ERC20 {
  constructor() ERC20('test USDT Stablecoin', 'testUSDT') {}

  function mint(address to, uint amount) external {
    _mint(to, amount);
  }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}
//*****************************************************************************************************************