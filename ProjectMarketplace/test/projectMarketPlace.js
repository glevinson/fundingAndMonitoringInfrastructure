// const { assert } = require("chai");
const ProjectMarketPlace = artifacts.require('ProjectMarketPlace');
const testDAI = artifacts.require('testDAI');

contract( 'ProjectMarketPlace', async accounts => {

    let projectMarketPlace;
    let _testDAI;
    let targetAmount = 1000;
    let _tokenID;
    const _name = "Test Project";
    const _symbol = "testP"; // This should applied to the code from the ref below [*]
    const _tokenURI = "Test tokenURI"

    before('Deploy Test DAI', async () => {
        _testDAI = await testDAI.new();
    })

    beforeEach('Deploy Contract', async () => {
        projectMarketPlace = await ProjectMarketPlace.new();
    })

    describe.only( 'createProject Function', function() {

        beforeEach('CreateProject', async() => {
            _tokenID = (await projectMarketPlace.createProject(targetAmount, _name, _symbol, _tokenURI, _testDAI.address ));
            console.log("Token ID: " + _tokenID + " of type: " + typeof(_tokenID));
        })

        it('Mints NFT', async () => {
            assert(_tokenID != 0, 'NFT Not Created'); // Token ID is the integer of the fundraising contract address
        })

        it('Deploys FundRaising Contract', async () => {
            
        })

        it('Sends NFT To FundRaising Contract', async () => {
            
        })
    })

 })