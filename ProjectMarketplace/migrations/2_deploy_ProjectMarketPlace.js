var ProjectMarketplace = artifacts.require("ProjectMarketplace"); // contract names
var Fundraising = artifacts.require("Fundraising.sol");

// module.exports = function(deployer) {
//     deployer.deploy(ProjectMarketPlace, {overwite: false}); // Cannot redeploy ProjectMarketPlace

    

// };

module.exports = async (deployer) => {
    await deployer.deploy(ProjectMarketplace);
    _projectMarketplace = await ProjectMarketplace.deployed();
    await _projectMarketplace.createProject( 1, "Project 1", "P1", "Test Token URI", 50, "0x6B175474E89094C44Da98b954EedeAC495271d0F" );
};

// I think for this, I need a script for deploying the ProjectMarketPlace, then for creating some projects
// I think we play around with the functionality in tests:
// [Internal tests in solidity & external tests in javascript, whatever the hell that means]

// What contract has the projects NFT been sent to
// How do I now find the newly deployed FundRaising contract
// Once found, how do I invest & withdraw investment with 