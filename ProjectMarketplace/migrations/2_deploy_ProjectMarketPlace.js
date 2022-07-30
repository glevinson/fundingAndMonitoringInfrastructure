var ProjectMarketPlace = artifacts.require("ProjectMarketPlace"); // contract names
var FundRaising = artifacts.require("FundRaising.sol");

// module.exports = function(deployer) {
//     deployer.deploy(ProjectMarketPlace, {overwite: false}); // Cannot redeploy ProjectMarketPlace

    

// };

module.exports = async (deployer) => {
    await deployer.deploy(ProjectMarketPlace, "");
    _projectMarketPlace = await ProjectMarketPlace.deployed();
    await _projectMarketPlace.createProject( 1, "Project 1", "P1", "0x6B175474E89094C44Da98b954EedeAC495271d0F" );
};

// I think for this, I need a script for deploying the ProjectMarketPlace, then for creating some projects
// I think we play around with the functionality in tests:
// [Internal tests in solidity & external tests in javascript, whatever the hell that means]

// What contract has the projects NFT been sent to
// How do I now find the newly deployed FundRaising contract
// Once found, how do I invest & withdraw investment with 