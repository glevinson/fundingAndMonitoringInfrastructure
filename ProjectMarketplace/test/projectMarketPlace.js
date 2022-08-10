const ProjectMarketplace = artifacts.require('ProjectMarketplace');
const Fundraising = artifacts.require('Fundraising');
const testDAI = artifacts.require('testDAI');

contract( 'ProjectMarketplace', async accounts => {

    let projectMarketplace;
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
        projectMarketplace = await ProjectMarketplace.new();
    })

    describe('Contract Initialisation', function () {

        it('Correct Name', async () => {
            const name = await projectMarketplace.name();
            assert(name == _name, 'Incorrect Name'); // WHY DID ABOVE FUNCTION CALL RETURN TRANSACTION INFO WHEREAS THIS JUST RETURNS THE NAME AS WANTED?
        });

        it('Correct Symbol', async () => {
            const symbol = await projectMarketplace.symbol();
            assert(symbol == _symbol, 'Incorrect Symbol');
        });
    });

    describe( 'Creating Project', function() {

        beforeEach('CreateProject', async() => {
            tokenID = await projectMarketplace.createProject.call(targetAmount, _name, _symbol, _tokenURI, dataAccessThreshold, _testDAI.address);
            await projectMarketplace.createProject(targetAmount, _name, _symbol, _tokenURI, dataAccessThreshold, _testDAI.address);
        })

        describe('Create Project Function', function(){
        
            it('Mints NFT', async () => {
                assert(tokenID != 0, 'NFT Not Created'); // Token ID is the integer of the fundraising contract address
            })

            it('Sends NFT To Fundraising Contract', async () => {
                let nftOwner = await projectMarketplace.ownerOf(tokenID);
                let fundraisingAddress = "0x" + tokenID.toString(16);
                nftOwner = nftOwner.toLowerCase() // One returns some of address characters in caps and others in lower, addresses are not case sensitive so doesn't matter but therefore need to get to same format
                fundraisingAddress = fundraisingAddress.toLowerCase()
                assert(nftOwner == fundraisingAddress, 'NFT Not Sent To Fundraising');
            })

            describe( 'Deploys Fundraising Contract', function() {

                beforeEach('Get Fundraising Contract', async() => {
                    const fundraisingAddress = "0x" + tokenID.toString(16);
                    fundraising = await Fundraising.at(fundraisingAddress);
                })

                it('Correct Name', async () => {
                    const name = await fundraising.name();
                    assert(name == _name, 'Incorrect Name'); // WHY DID ABOVE FUNCTION CALL RETURN TRANSACTION INFO WHEREAS THIS JUST RETURNS THE NAME AS WANTED?
                });
        
                it('Correct Symbol', async () => {
                    const symbol = await fundraising.symbol();
                    assert(symbol == _symbol, 'Incorrect Symbol');
                });
        
                it('Correct Target Amount', async () => {
                    const _targetAmount = (await fundraising.targetAmount()).toNumber();
                    assert(_targetAmount == targetAmount, 'Incorrect Target Amount');
                });
        
                it('Correct Data Access Threshold', async () => {
                    const _dataAccessThreshold = (await fundraising.dataAccessThreshold()).toNumber();
                    assert(_dataAccessThreshold == dataAccessThreshold, 'Incorrect Data Access Threshold')
                });

                it('Correct DAI Address', async () => {
                    const testDaiAddress = (await fundraising.coin());
                    assert(_testDAI.address == testDaiAddress, 'Incorrect Test DAI Address')
                });

            })
        })

        it('Correct Token URI', async () => {
            const URI = await projectMarketplace.tokenURI(tokenID);
            assert(URI == _tokenURI, 'Incorrect Token URI');
        });

        it('Find Correct Project Fundraise', async () => {
            const fundraisingAddress1 = ("0x" + tokenID.toString(16)).toLowerCase();
            const fundraisingAddress2 = (await projectMarketplace.findProjectFundraise(tokenID)).toLowerCase();
            assert(fundraisingAddress1 == fundraisingAddress2, 'Incorrect Fundraising Affress');
        });
    })
 })