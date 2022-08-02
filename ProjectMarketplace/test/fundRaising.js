
// Need to work out why beforeEach requires the this pointer. It is fine but annoying to change.
// Update beforeEach
// Make a describe for all investment tests
// Test all different investment scenarios: someone invests it all (i.e. get the NFT), the NFT is paused or there isn't enough supply
// Then need to test withdraw
// Then go to ProjectMarketPlace to test createProject & findprojectContract
// Then see what system / integration tests may need to be done...


// A lot of inspiration from: https://www.youtube.com/watch?v=9CBDj5A-zz4 // async addresses, investor consts, ...

// beforeEach({
                // NOTE: This should deploy testDAI and FundRaising!
                // Reference [*]: 18:45, https://www.youtube.com/watch?v=v90hvMEjf_Q
// })

const FundRaising = artifacts.require('FundRaising');
const testDAI = artifacts.require('testDAI');
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');

contract( 'FundRaising', async accounts => {  // is this fine to put async up here

    const maxTestDAI_amount = web3.utils.toWei('10000');
    const [admin, investor1, investor2, investor3, _] = accounts; // Naming the first 4 addresses

    const _name = "Test Project";
    const _symbol = "testP"; // This should applied to the code from the ref below [*]
    let targetAmount = 1000;
    
    let _testDAI;
    let fundRaising; // Not sure how to make consts
    const daiMintAmount = 1000;
    let rftSupply;
    let daiBalanceContract;

    before('Deploy Contract', async () => {
        _testDAI = await testDAI.new(); // QUESTION: For some reason only working with "this.", how do with const instead?
    })

    beforeEach('Deploy Contract', async () => {
        fundRaising = await FundRaising.new(targetAmount, _name, _symbol, admin, _testDAI.address); // contract instance is a variable that points at a deployed contract
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

    describe( 'Investing', function() {
        beforeEach('Setup FundRaising', async () => {

            await Promise.all([
                _testDAI.mint(admin, daiMintAmount ),
                _testDAI.mint(investor1, daiMintAmount ),
                _testDAI.mint(investor2, daiMintAmount ),
                _testDAI.mint(investor3, daiMintAmount )
            ]);

            await Promise.all([
                _testDAI.approve(fundRaising.address, daiMintAmount, {from: admin} ),
                _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor1} ),
                _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor2} ),
                _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor3} )
            ]);
        })

        // NB: NEED AN AFTER EACH, BURN ALL INVESTORS TOKENS

        context( 'Contract unpaused', function() {
            context( 'Enough Tokens Available', function() {
                context ( 'Target Not Raised', function() {
    
                    describe( 'Invest Function', function() {
                        let amountInvest;

                        beforeEach('Investment', async () => { // This occurs before the higher level 'BeforeEach', it goes lower level before, upper level before each, lower level before each, test, upperlevel before each, lower lever before each, test, etc...
                            amountInvest = 10;
                            await fundRaising.invest(amountInvest, {from: investor1});
                        })

                        // Not sure this test neccessary:
                        it('Investor sends DAI', async () => {
                            let daiBalanceInvestor = (await _testDAI.balanceOf(investor1)).toNumber();
                            assert( daiBalanceInvestor - daiMintAmount == - amountInvest, 'Investor Charged Incorrect DAI' );
                        });
                        
                        it('Contract Recieves Correct DAI', async () => {
                            let daiBalanceContract = (await _testDAI.balanceOf(fundRaising.address)).toNumber();
                            assert( daiBalanceContract == amountInvest );
                        });
            
                        it('Invester Recieves Correct RFTs', async () => {
                            let rftBalanceInvestor = (await fundRaising.balanceOf(investor1)).toNumber();
                            assert( rftBalanceInvestor == amountInvest );
                        });
                        
                        // Not sure this test neccessary:
                        it('RFT Supply Correctly Adjusted', async () => {
                            let rftSupply = (await fundRaising.totalSupply()).toNumber();
                            assert( rftSupply == amountInvest );
                        });

                        it.only('Withdraw Funds To Admin Once Target Raised', async () => {
                            // Raise Funds to target:
                            await fundRaising.invest(targetAmount - amountInvest, {from: investor3});

                            let daiBalanceContract = (await _testDAI.balanceOf(fundRaising.address)).toNumber();
                            let daiBalanceAdmin = (await _testDAI.balanceOf(admin)).toNumber();
                            assert( daiBalanceContract == 0 );
                            console.log("Admin DAI: ", daiBalanceAdmin);
                            console.log("Target Amount: ", targetAmount); // NB: MAKE APPROPRIATE CHANGES
                            assert( daiBalanceAdmin == targetAmount + daiMintAmount); // Change so admin doesnt get dai
                        });
                    });
                });

                context ( 'Target Raised', function() {

                    it('Cannot invest', async () => {
                        await fundRaising.invest(500, {from: investor1});
                        await fundRaising.invest(500, {from: investor2});
                        await truffleAssert.reverts( 
                        fundRaising.invest(1, {from: investor1}), "Target Already Raised");
                    });
                })

            });

            context( 'Not Enough Tokens Available', function() {

                it('Cannot invest', async () => {
                    // Target Amount Initiallised to 1000
                    await fundRaising.invest(900, {from: investor1});
                    await truffleAssert.reverts( 
                        fundRaising.invest(110, {from: investor2}), "Not enough shares left!");
                });    
            });
        });
        context ( 'Contract Paused', function() {

            beforeEach('Pause Contract', async () => {
                fundRaising.pause();
            })

            it('Cannot invest', async () => {
                await truffleAssert.reverts( 
                fundRaising.invest(1, {from: investor1}), "Contract Is Paused");
            });
        });
    });

    describe( 'Withdrawing', function() {

    })
});