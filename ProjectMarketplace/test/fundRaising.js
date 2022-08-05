
// Need to add scenario for investing the whole amount and therefore getting the NFT. Need to simulate a ERC-721 contract calling fundraising. 
// This could be a testERC-721 that just calls fundraising. Therefore th
// Then go to ProjectMarketPlace to test createProject & findprojectContract
// Then see what system / integration tests may need to be done...


// A lot of inspiration from: https://www.youtube.com/watch?v=9CBDj5A-zz4 // async addresses, investor consts, ...

const testERC721 = artifacts.require('testERC721');
const FundRaising = artifacts.require('FundRaising');
const testDAI = artifacts.require('testDAI');
const truffleAssert = require('truffle-assertions');

contract( 'FundRaising', async accounts => {  // is this fine to put async up here

    const maxTestDAI_amount = web3.utils.toWei('10000');
    const [admin, investor1, investor2, investor3, _] = accounts; // Naming the first 4 addresses

    const _name = "Test Project";
    const _symbol = "testP"; // This should applied to the code from the ref below [*]
    let targetAmount = 1000;
    let dataAccessThreshold = 50 // Equivalent to $50
    
    let _testDAI;
    let fundRaising; // Not sure how to make consts
    const daiMintAmount = 1000;
    let rftSupply;
    let daiBalanceContract;

    // before('Deploy Contract', async () => {
    //     _testDAI = await testDAI.new(); // QUESTION: For some reason only working with "this.", how do with const instead?
    // })

    // const fs = require('fs');
    // const abiFundRaising = JSON.parse(fs.readFileSync('./build/contracts/FundRaising.json', 'utf8'));
    // console.log(JSON.stringify(contract.abi));

    beforeEach('Deploy Contract', async () => {
        // Reset testDAI and FundRaising for each test:
        _testDAI = await testDAI.new();
        // const _testERC721 = await testERC721.new();
        // const fundraisingAddress = await _testERC721.createProject(targetAmount, _name, _symbol, _testDAI.address);
        // fundraising = await fundraisingAddress.deployed();
        fundRaising = await FundRaising.new(targetAmount, _name, _symbol, dataAccessThreshold, admin, _testDAI.address); // contract instance is a variable that points at a deployed contract
    })

    describe( 'Contract Initialisation', function() {

        it('Correct Name', async () => {
            const name = await fundRaising.name();
            assert ( name == _name, 'Incorrect Name' );
        });

        it('Correct Symbol', async () => {
            const symbol = await fundRaising.symbol();
            assert ( symbol == _symbol, 'Incorrect Name' );
        });

        it('Correct Target Amount', async () => {
            const _targetAmount = (await fundRaising.targetAmount()).toNumber();
            assert ( _targetAmount == targetAmount, 'Incorrect Target Amount' );
        });

        it('Correct Data Access Threshold', async () => {
            const _dataAccessThreshold = (await fundRaising.dataAccessThreshold()).toNumber();
            assert( _dataAccessThreshold == dataAccessThreshold, 'Incorrect Data Access Threshold' )
        })

        it('Has 0 DAI Balance', async () => {
            const daiBalance = (await _testDAI.balanceOf(fundRaising.address)).toNumber();
            assert ( daiBalance == 0, 'Incorrect DAI Balance' );
        });

        it('Has 0 RFT Supply', async() => {
            const rftSupply = (await fundRaising.totalSupply()).toNumber();
            assert ( rftSupply == 0, 'Incorrect RFT Supply' );
        });

        it('Is Paused', async () => {
            const paused = await fundRaising._paused();
            assert ( !paused, 'Contract Initiallised Paused' );
        });

        describe( 'Pause Function', function() {
            
            it('Admin can pause', async () => {
                await fundRaising.pause({from: admin });
                const paused = await fundRaising._paused();
                assert ( paused, "Admin Cannot Pause" );
            });

            it('Admin can unpause', async () => {
                await fundRaising.pause({from: admin });
                await fundRaising.unpause({from: admin });
                const paused = await fundRaising._paused();
                assert ( !paused, "Admin Cannot Unpause" );
            });

            it('Non-admin cannot pause' , async () => {
                await truffleAssert.reverts( 
                    fundRaising.pause({from: investor1}), "Only Admin Can Pause/Unpause");
            });

            it('Non-admin cannot unpause', async () => {
                await fundRaising.pause({from: admin });
                await truffleAssert.reverts( 
                    fundRaising.unpause({from: investor1}), "Only Admin Can Pause/Unpause");
            });
        } );

    });

    async function mintAndApprove(){
        await Promise.all([
            _testDAI.mint(investor1, daiMintAmount ),
            _testDAI.mint(investor2, daiMintAmount ),
            _testDAI.mint(investor3, daiMintAmount )
        ]);

        await Promise.all([
            _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor1} ),
            _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor2} ),
            _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor3} )
        ]);
    }

    describe( 'Invest Function', function() {
        let amountInvest;
        
        beforeEach('Mint DAI & Approve Spending', async () => {

            await Promise.all([
                _testDAI.mint(investor1, daiMintAmount ),
                _testDAI.mint(investor2, daiMintAmount ),
                _testDAI.mint(investor3, daiMintAmount )
            ]);

            await Promise.all([
                _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor1} ),
                _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor2} ),
                _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor3} )
            ]);
        })
            
        context( 'Contract unpaused', function() {
            context( 'Enough Tokens Available', function() {
                context ( 'Target Not Raised', function() {
    
                    // describe( 'Invest Function', function() {
                    //     let amountInvest;

                    beforeEach('Investment', async () => { // This occurs before the higher level 'BeforeEach', it goes lower level before, upper level before each, lower level before each, test, upperlevel before each, lower lever before each, test, etc...
                        amountInvest = 10;
                        await fundRaising.invest(amountInvest, {from: investor1});
                    })

                    // Not sure this test neccessary:
                    it('Investor Charged Correct DAI', async () => {
                        let daiBalanceInvestor = (await _testDAI.balanceOf(investor1)).toNumber();
                        assert( daiBalanceInvestor - daiMintAmount == - amountInvest, 'Investor Charged Incorrect DAI' );
                    });
                    
                    it('Contract Recieves Correct DAI', async () => {
                        let daiBalanceContract = (await _testDAI.balanceOf(fundRaising.address)).toNumber();
                        assert( daiBalanceContract == amountInvest );
                    });
        
                    it('Investor Recieves Correct RFTs', async () => {
                        let rftBalanceInvestor = (await fundRaising.balanceOf(investor1)).toNumber();
                        assert( rftBalanceInvestor == amountInvest );
                    });
                    
                    // Not sure this test neccessary:
                    it('RFT Supply Increased Correctly', async () => {
                        let rftSupply = (await fundRaising.totalSupply()).toNumber();
                        assert( rftSupply == amountInvest );
                    });

                    /* PROBLEM - Think fixed?:
                        This test means the DAI for the contract are sent to the admin
                        This, correctly so, leaves investor 1 with a value of 10 RFTs and investor 3 with value of 990 RFTs that cannot be withdrawn
                        because their balances of DAI is now 0
                    */
                    it('Send Funds To Admin Once Target Raised', async () => {
                        // Raise Funds to target:
                        await fundRaising.invest(targetAmount - amountInvest, {from: investor3});

                        let daiBalanceContract = (await _testDAI.balanceOf(fundRaising.address)).toNumber();
                        let daiBalanceAdmin = (await _testDAI.balanceOf(admin)).toNumber();
                        assert( daiBalanceContract == 0 );
                        assert( daiBalanceAdmin == targetAmount); // Change so admin doesnt get dai
                    });
                });

                context ( 'Target Raised', function() {

                    it('Cannot Invest', async () => {
                        await fundRaising.invest(500, {from: investor1});
                        await fundRaising.invest(500, {from: investor2});
                        await truffleAssert.reverts( 
                        fundRaising.invest(1, {from: investor1}), "Target Already Raised");
                    });
                });
            });
        });

            context( 'Not Enough Tokens Available', function() {

                it('Cannot invest', async () => {
                    // Target Amount Initiallised to 1000
                    await fundRaising.invest(900, {from: investor1});
                    await truffleAssert.reverts( 
                        fundRaising.invest(110, {from: investor2}), "Not enough shares left!");
                });    
            });
        context ( 'Contract Paused', function() {

            it('Cannot invest', async () => {
                fundRaising.pause();
                await truffleAssert.reverts( 
                fundRaising.invest(1, {from: investor1}), "Contract Is Paused");
            });
        });
    });

    describe( 'Withdraw Investment Function', function() {

        beforeEach('Mint DAI & Approve Spending', async () => {

            await Promise.all([
                _testDAI.mint(investor1, daiMintAmount ),
                _testDAI.mint(investor2, daiMintAmount ),
                _testDAI.mint(investor3, daiMintAmount )
            ]);

            await Promise.all([
                _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor1} ),
                _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor2} ),
                _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor3} )
            ]);
        })

        context('Withdrawal Value <= Amount Invested', function(){

            beforeEach('Invest & Withdraw Investment', async () => { // This occurs before the higher level 'BeforeEach', it goes lower level before, upper level before each, lower level before each, test, upperlevel before each, lower lever before each, test, etc...
                amountInvest = 20;
                await fundRaising.invest(amountInvest, {from: investor1});
                await fundRaising.withdrawInvestment(amountInvest, {from: investor1});
            });

            it('Investor Returned Correct DAI', async () => {
                let daiBalanceInvestor = (await _testDAI.balanceOf(investor1)).toNumber();
                assert( daiBalanceInvestor == daiMintAmount, 'Investor Charged Incorrect DAI' );
            });

            it('Contract Sends Correct DAI', async () => {
                let daiBalanceContract = (await _testDAI.balanceOf(fundRaising.address)).toNumber();
                assert( daiBalanceContract == 0 );
            });

            it ('Investor Charged Correct RFTs', async () =>{
                let rftBalanceInvestor = (await fundRaising.balanceOf(investor1)).toNumber();
                assert( rftBalanceInvestor == 0 ); 
            });

            it('RFT Supply Decreased Correctly', async () => {
                let rftSupply = (await fundRaising.totalSupply()).toNumber();
                assert( rftSupply == 0 );
            });
        });

        context( 'Withdrawal Value > Amount Invested', function() {
            it('Cannot Withdraw', async () => {
                amountInvest = 20;
                await fundRaising.invest(amountInvest, {from: investor1});
                await truffleAssert.reverts( 
                    fundRaising.withdrawInvestment((amountInvest + 1), {from: investor1}));
            });
        });

        context( 'Target Raised', function () {
            it('Cannot Withdraw Investment', async () => {
                await fundRaising.invest(500, {from: investor1});
                await fundRaising.invest(500, {from: investor2});
                await truffleAssert.reverts( 
                    fundRaising.withdrawInvestment(500, {from: investor1}), "Target Already Raised");
                await truffleAssert.reverts( 
                    fundRaising.withdrawInvestment(500, {from: investor2}), "Target Already Raised");
            });
        });
    });

    describe( 'Redeem NFT Function', function() { 

        beforeEach('Mint DAI & Approve Spending', async () => {

            await Promise.all([
                _testDAI.mint(investor1, daiMintAmount ),
                _testDAI.mint(investor2, daiMintAmount ),
                _testDAI.mint(investor3, daiMintAmount )
            ]);

            await Promise.all([
                _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor1} ),
                _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor2} ),
                _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor3} )
            ]);
        })


        // PROBLEM: GET FOLLOWING ERROR: "Error: Returned error: VM Exception while processing transaction: revert" For the line that sends investor 1 the NFT
        // PROBLEM IS THAT FOR CREATE PROJECT, THE NFT USES THE MSG SENDER ADDRESS FOR ITS INSTANCE, IN REALITY THIS COMES FROM PROJECTMARKETPLACE
        // HOWEVER, HERE, IT COMES FROM ADMIN. SO CANNOT CALL ANY ERC721 FUNCTIONS (like here safeTransferFrom) because, in this test script, 
        // fundraising.nft isnt actually an NFT, it's nothing!
        context ('Single Investor Invests Target Amount (Owns Total RFT Supply)', function() {

            beforeEach('Invest Full Target Amount', async () => {
                await fundRaising.invest(targetAmount, {from: investor1});
                console.log((await fundRaising.totalSupply()).toNumber())
                console.log((await fundRaising.balanceOf(investor1)).toNumber())
                console.log(targetAmount)
                // await fundRaising.redeemNFT({from: investor1});
                console.log((await fundRaising.totalSupply()).toNumber())
                console.log((await fundRaising.balanceOf(investor1)).toNumber())
            })

            it('RFTs burned', async () => {
                // console.log(await fundRaising.totalSupply())
                // assert( (await fundRaising.totalSupply()) == 0 )
            })

            // it('NFT Transfered to Investor', async () => {
            //     const tokenID = parseInt(fundRaising.address, 16) // Convert address to tokenID
            //     assert(fundRaising.NFT.ownerOf(tokenID) == investor1)
            // })
        })

        context ('Single Investor Does Not Invest Target Amount (Not Own Total RFT Supply', async() => {

            it('Cannot Redeem', async () => {
                await fundRaising.invest(500, {from: investor1})
                await fundRaising.invest(500, {from: investor2})
                await truffleAssert.reverts( 
                    fundRaising.redeemNFT({from: investor1}), "Do Not Have RFT Total Supply")
                await truffleAssert.reverts( 
                    fundRaising.redeemNFT({from: investor1}), "Do Not Have RFT Total Supply")
            })
        })
    })
});