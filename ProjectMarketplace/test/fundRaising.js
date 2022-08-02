
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
            const _targetAmount = await fundRaising.targetAmount();
            assert ( _targetAmount == targetAmount, 'Incorrect Target Amount' );
        });

        it('Has 0 DAI Balance', async () => {
            const daiBalance = await _testDAI.balanceOf(fundRaising.address);
            assert ( daiBalance == 0, 'Incorrect DAI Balance' );
        });

        it('Is Paused', async () => {
            const paused = await fundRaising._paused();
            assert ( !paused, 'Contract Initiallised Paused' );
        });

        describe( 'Pause', function() {
            
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
                _testDAI.mint(admin, daiMintAmount ), // PROBLEM: THIS IS REMINTING 1000 NEW TEST DAI FOR EACH INVESTOR BEFORE EACH TEST, PROBS NEED TO SET THEM TO 0
                _testDAI.mint(investor1, daiMintAmount ),
                _testDAI.mint(investor2, daiMintAmount ),
                _testDAI.mint(investor3, daiMintAmount )
            ]);

            rftSupply = await fundRaising.totalSupply();
            daiBalanceContract = await _testDAI.balanceOf(fundRaising.address);
            assert(rftSupply == 0);
            assert(daiBalanceContract == 0);

            await Promise.all([
                _testDAI.approve(fundRaising.address, daiMintAmount, {from: admin} ),
                _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor1} ),
                _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor2} ),
                _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor3} )
            ]);
        })

        context( 'Contract unpaused', function() {
            context( 'Enough Tokens Avaialble', function() {

            });
            context( 'Not Enough Tokens Available', function() {

            });
        });

        context.only( 'Invest: if contract unpaused & enough tokens available', function() {

            it('Investor sends DAI', async () => {
                let daiBalanceInvestorBefore = (await _testDAI.balanceOf(investor1));
                await fundRaising.invest(10, {from: investor1});
                let daiBalanceInvestorAfter = (await _testDAI.balanceOf(investor1));
                assert( daiBalanceInvestorAfter - daiBalanceInvestorBefore == -10 );
            });
            
            it('Contract Recieves Correct DAI', async () => {
                let daiBalanceContractBefore = (await fundRaising.totalSupply()).toNumber();
                await fundRaising.invest(10, {from: investor1});
                let daiBalanceAdminAfter = (await fundRaising.totalSupply()).toNumber();
                assert( daiBalanceAdminAfter - daiBalanceContractBefore == 10 );
            });

            it('Invester Recieves Correct RFTs', async () => {
                let rftBalanceInvestorBefore = (await fundRaising.balanceOf(investor1)).toNumber();
                await fundRaising.invest(10, {from: investor1});
                let rftBalanceInvestorAfter = (await fundRaising.balanceOf(investor1)).toNumber();
                assert( rftBalanceInvestorAfter - rftBalanceInvestorBefore == 10 );
            });

            it('RFT supply adjusted', async () => {
                let rftSupplyBefore = (await fundRaising.totalSupply()).toNumber();
                await fundRaising.invest(10, {from: investor1});
                let rftSupplyAfter = (await fundRaising.totalSupply()).toNumber();
                assert( rftSupplyAfter - rftSupplyBefore == 10 );
            });

        });

        /* Approves the fundraising contract for an investor for a specified amount ('amountApproved')
            and invests another specified amount ('amountInvest') */
        // ************************************************************************************     
        async function investAssert(investor, amountInvest) {
            
            let rftBalanceInvestorBefore = await fundRaising.balanceOf(investor);
            let daiBalanceInvestorBefore = await _testDAI.balanceOf(investor);

            await fundRaising.invest(amountInvest, {from: investor});

            let rftBalanceInvestor = await fundRaising.balanceOf(investor);
            // console.log("RFT balance of investor: " + rftBalanceInvestor.toNumber());
            let daiBalanceInvestor = await _testDAI.balanceOf(investor); // QUESTION: .toNumber() better than Parse?
            // console.log("rft balance using .toNumber(), daibalinv = " + daiBalanceInvestor.toNumber() + " & with type: " + typeof(daiBalanceInvestor.toNumber()));
            assert( parseInt(rftBalanceInvestor - rftBalanceInvestorBefore) == amountInvest, "Investor Has Incorrect RFT Balance");
            // console.log(parseInt(daiBalanceInvestor - daiBalanceInvestorBefore)); // THIS EQUATION IS CORRECT! 
            // console.log(-amountInvest);
            // assert( parseInt(daiBalanceInvestor - daiBalanceInvestorBefore) == -amountInvest, "Investor Has Incorrect DAI Balance"); // THIS IS THE ERROR FOR THE FIRST INVEST TEST
        };

        async function rftSupplyChangeAssert( rftSupplyChange ) {
            let rftSupplyBefore = rftSupply;
            rftSupply = await fundRaising.totalSupply(); // Has to be await as interacting with smart contract is asynchronous (returns promise)
            assert( rftSupply - rftSupplyBefore == rftSupplyChange, "Incorrect supply of RFT");
            // console.log("RFT supply change (in assertion function): " + (rftSupply - rftSupplyBefore) + " == " + rftSupplyChange);
            // console.log("At the end of rft supply assert function, total supply = ", rftSupply);
        }

        async function daiBalanceContractChangeAssert( daiBalanceChange ) {
            let daiBalanceContractBefore = daiBalanceContract;
            daiBalanceContract = await _testDAI.balanceOf(fundRaising.address); // updating DAI balance
            assert( daiBalanceContract - daiBalanceContractBefore == daiBalanceChange, "Contract Has Incorrect DAI Balance");
            // console.log("daiBalanceContract change (in assertion function): " + (daiBalanceContract - daiBalanceContractBefore) + " == " + daiBalanceChange);
            // console.log("At the end of contract dai balance assert function, balance = ", parseInt(daiBalanceContract));
        }

        // it.only('Should deploy smart contract properly', async () => {
        //     assert(fundRaising.address !== '');
        // });

        it('Cannot invest if contract paused', async () => {
            // Contract (by default) unpaused - can invest
            // ***************************************************************************
            await investAssert( investor1, 10 ); // Investor 1 invests 10
            await rftSupplyChangeAssert(10);
            await daiBalanceContractChangeAssert(10);

            // Contract paused - cannot invest
            // ***************************************************************************
            await fundRaising.pause({from: admin }); // Admin pauses contract
            await truffleAssert.reverts( 
                fundRaising.invest(10, {from: investor1}), "Contract Is Paused");

            // Tests ensuring no transactions successful for investor 1:
            assert( parseInt(await fundRaising.balanceOf(investor1)) == 10, "Investor 1 Has Incorrect RFT Balance");
            console.log("In the test function: " + parseInt(await _testDAI.balanceOf(investor1)) );
            console.log("In the test function: " + (daiMintAmount - 10) );
            // assert( parseInt(await _testDAI.balanceOf(investor1)) == daiMintAmount - 10, "Investor 1 Has Incorrect DAI Balance");
            await rftSupplyChangeAssert(0);
            await daiBalanceContractChangeAssert(0);

            // Contract unpaused - can invest
            // ***************************************************************************
            await fundRaising.unpause({from: admin });
            await investAssert(investor1, 10);
            await rftSupplyChangeAssert(10);
            await daiBalanceContractChangeAssert(10);
        });

        it('Cannot invest if not enough shares available', async () => {

            // Target Amount is initiallised to 1000;
            await investAssert( investor1, 900 );
            await rftSupplyChangeAssert(900);
            await daiBalanceContractChangeAssert(900);

            await truffleAssert.reverts( 
                fundRaising.invest(110, {from: investor2}), "Not enough shares left!");
                
        });

        it('Send NFT in return for investment (if amount == target) if there are enough shares & contract not paused', async () => {

            await investAssert( investor2, 1000 );
            await rftSupplyChangeAssert( 1000 );
            await daiBalanceContractChangeAssert(0); // DAI instantly sent to admin

        });

        it('Sends funds raised to admin once target reached', async () => {

            await investAssert( investor1, 500 );
            await rftSupplyChangeAssert( 500 );
            await daiBalanceContractChangeAssert(500);

            let daiBalanceAdminBefore = (await _testDAI.balanceOf(admin)).toNumber();
            await investAssert( investor2, 500 );
            await rftSupplyChangeAssert( 500 );

            // Funds raised - sent from contract to admin
            console.log( "Contract balance: " + (await _testDAI.balanceOf(admin)).toNumber() + " & data type: " + typeof((await _testDAI.balanceOf(admin)).toNumber()) );
            assert( (await _testDAI.balanceOf(fundRaising.address)).toNumber() == 0 );
            assert( (await _testDAI.balanceOf(admin)).toNumber() - daiBalanceAdminBefore == targetAmount );

        });

        it('Send RFTs in return for investment (if amount != target) if there are enough shares & contract not paused', async () => {

            // Investor 1: Invests 10 Wei of DAI
            // ************************************************************************************     
            await investAssert( investor1, 10 );
            await rftSupplyChangeAssert(10); // QUESTION: IS AWAIT REALLY NEEDED ON RFTSUPPLYASSERT OR DAIBALANCEASSERT AS WORKED WITHOUT
            await daiBalanceContractChangeAssert(10);
            // ************************************************************************************

            // Investor 1: Invests another 10 Wei of DAI
            // ************************************************************************************     
            await investAssert( investor1, 10 );
            await rftSupplyChangeAssert(10);
            await daiBalanceContractChangeAssert(10);
            // ************************************************************************************     
        
            // Investor 2: Invests 20 Wei of DAI
            // ************************************************************************************
            await investAssert( investor2, 20 );
            await rftSupplyChangeAssert(20);
            await daiBalanceContractChangeAssert(20);

            // Investor 3: Invests 30 Wei of DAI
            // ************************************************************************************
            await investAssert( investor3, 30 ); 
            await rftSupplyChangeAssert(30);
            await daiBalanceContractChangeAssert(30);

            // Admin: Invests 40 Wei of DAI
            // ************************************************************************************
            await investAssert( admin, 40 ); 
            await rftSupplyChangeAssert(40);
            await daiBalanceContractChangeAssert(40);

        });
    });


});