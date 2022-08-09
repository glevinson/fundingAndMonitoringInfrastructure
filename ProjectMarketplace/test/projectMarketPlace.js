// Maybe tests for tokenURI & findProjectContract
// Not sure if need all the tests below (repetition of tests)

const ProjectMarketPlace = artifacts.require('ProjectMarketPlace');
const FundRaising = artifacts.require('FundRaising');
const testDAI = artifacts.require('testDAI');

contract( 'ProjectMarketPlace', async accounts => {

    let projectMarketPlace;
    let _testDAI;
    let targetAmount = 1000;
    let tokenID;
    let dataAccessThreshold = 50;
    const _name = "The Sping DAO Project Marketplace Test";
    const _symbol = "SpringDAOtest"; // This should applied to the code from the ref below [*]
    const _tokenURI = "Test tokenURI"

    before('Deploy Test DAI', async () => {
        _testDAI = await testDAI.new();
    })

    beforeEach('Deploy Contract', async () => {
        projectMarketPlace = await ProjectMarketPlace.new();
    })

    describe('Contract Initialisation', function () {

        it('Correct Name', async () => {
            const name = await projectMarketPlace.name();
            assert(name == _name, 'Incorrect Name'); // WHY DID ABOVE FUNCTION CALL RETURN TRANSACTION INFO WHEREAS THIS JUST RETURNS THE NAME AS WANTED?
        });

        it('Correct Symbol', async () => {
            const symbol = await projectMarketPlace.symbol();
            assert(symbol == _symbol, 'Incorrect Symbol');
        });
    });

    describe( 'createProject Function', function() {

        beforeEach('CreateProject', async() => {
            tokenID = await projectMarketPlace.createProject.call(targetAmount, _name, _symbol, _tokenURI, dataAccessThreshold, _testDAI.address);
            await projectMarketPlace.createProject(targetAmount, _name, _symbol, _tokenURI, dataAccessThreshold, _testDAI.address);
        })

        it('Mints NFT', async () => {
            assert(tokenID != 0, 'NFT Not Created'); // Token ID is the integer of the fundraising contract address
        })

        it('Sends NFT To FundRaising Contract', async () => {
            let nftOwner = await projectMarketPlace.ownerOf(tokenID);
            let fundraisingAddress = "0x" + tokenID.toString(16);
            nftOwner = nftOwner.toLowerCase() // One returns some of address characters in caps and others in lower, addresses are not case sensitive so doesn't matter but therefore need to get to same format
            fundraisingAddress = fundraisingAddress.toLowerCase()
            assert(nftOwner == fundraisingAddress, 'NFT Not Sent To FundRaising');
        })

        describe( 'Deploys FundRaising Contract', function() {

            beforeEach('Get FundRaising Contract', async() => {
                const fundraisingAddress = "0x" + tokenID.toString(16);
                fundRaising = await FundRaising.at(fundraisingAddress);
            })

            it('Correct Name', async () => {
                const name = await fundRaising.name();
                assert(name == _name, 'Incorrect Name'); // WHY DID ABOVE FUNCTION CALL RETURN TRANSACTION INFO WHEREAS THIS JUST RETURNS THE NAME AS WANTED?
            });
    
            it('Correct Symbol', async () => {
                const symbol = await fundRaising.symbol();
                assert(symbol == _symbol, 'Incorrect Symbol');
            });
    
            it('Correct Target Amount', async () => {
                const _targetAmount = (await fundRaising.targetAmount()).toNumber();
                assert(_targetAmount == targetAmount, 'Incorrect Target Amount');
            });
    
            it('Correct Data Access Threshold', async () => {
                const _dataAccessThreshold = (await fundRaising.dataAccessThreshold()).toNumber();
                assert(_dataAccessThreshold == dataAccessThreshold, 'Incorrect Data Access Threshold')
            });

        })
    })
 })