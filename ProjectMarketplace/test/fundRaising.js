
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
const truffleAssert = require('truffle-assertions');

contract( 'FundRaising', async accounts => {  // is this fine to put async up here

    const maxTestDAI_amount = web3.utils.toWei('10000');
    const [admin, investor1, investor2, investor3, _] = accounts; // Naming the first 4 addresses
    const _name = "Test Project";
    const _symbol = "testP"; // This should applied to the code from the ref below [*]
    
    let _testDAI;
    let fundRaising; // Not sure how to make consts
    const daiMintAmount = 100;
    let rftSupply;
    let daiBalanceContract;


    /* Approves the fundraising contract for an investor for a specified amount ('amountApproved')
        and invests another specified amount ('amountInvest') */
    // ************************************************************************************     
    async function investAssertion(investor, amountInvest, amountApproved) {
        await _testDAI.approve(fundRaising.address, amountApproved, {from: investor});
        await fundRaising.invest(amountInvest, {from: investor});

        let rftBalanceInvestor = await fundRaising.balanceOf(investor);
        let daiBalanceInvestor = await _testDAI.balanceOf(investor);

        assert( parseInt(rftBalanceInvestor) == amountInvest, "Investor Has Incorrect RFT Balance");
        assert( parseInt(daiBalanceInvestor) == daiMintAmount - amountInvest, "Investor Has Incorrect DAI Balance");
    };

    async function rftSupplyChangeAssert( rftSupplyChange ) {
        let rftSupplyBefore = rftSupply;
        rftSupply = await fundRaising.totalSupply(); // Has to be await as interacting with smart contract is asynchronous (returns promise)
        assert( rftSupply - rftSupplyBefore == rftSupplyChange, "Incorrect supply of RFT");
        console.log("RFT supply change (in assertion function): " + (rftSupply - rftSupplyBefore) + " == " + rftSupplyChange);
        console.log("At the end of rft supply assert function, total supply = ", rftSupply);
    }

    async function daiBalanceContractChangeAssert( daiBalanceChange ) {
        let daiBalanceContractBefore = daiBalanceContract;
        daiBalanceContract = await _testDAI.balanceOf(fundRaising.address); // updating DAI balance
        assert( daiBalanceContract - daiBalanceContractBefore == daiBalanceChange, "Contract Has Incorrect DAI Balance");
        console.log("daiBalanceContract change (in assertion function): " + (daiBalanceContract - daiBalanceContractBefore) + " == " + daiBalanceChange);
        console.log("At the end of contract dai balance assert function, balance = ", parseInt(daiBalanceContract));
    }


    beforeEach('Setup FundRaising', async () => {
        _testDAI = await testDAI.new(); // QUESTION: For some reason only working with "this.", how do with const instead?
        fundRaising = await FundRaising.new(10000, "Test Project", "testP", admin, _testDAI.address); // contract instance is a variable that points at a deployed contract
    
        await Promise.all([
            _testDAI.mint(admin, daiMintAmount ),
            _testDAI.mint(investor1, daiMintAmount ),
            _testDAI.mint(investor2, daiMintAmount ),
            _testDAI.mint(investor3, daiMintAmount )
        ]);

        rftSupply = await fundRaising.totalSupply();
        daiBalanceContract = await _testDAI.balanceOf(fundRaising.address);
        assert(rftSupply == 0);
        assert(daiBalanceContract == 0);
    })

    it/*.only*/('Should deploy smart contract properly', async () => {
        assert(fundRaising.address !== '');
    });

    it.only('Not allow investment if contract paused', async () => {
        await investAssertion( investor1, 10, 100 ); // Investor 1 invests 10
        await rftSupplyChangeAssert(10);
        await daiBalanceContractChangeAssert(10);

        await fundRaising.pause({from: admin }); // Admin pauses contracr

        // await fundRaising.invest(10, {from: investor1}); // This returns: Error: Returned error: VM Exception while processing transaction: revert Paused
        await truffleAssert.reverts( 
            fundRaising.invest(10, {from: investor1}), "Contract Is Paused");
        // console.log( "Balance of investor 1's RFTs: " +  await fundRaising.balanceOf(investor1) );
        // assert( parseInt(await fundRaising.balanceOf(investor1)) == 10, "Investor Has Incorrect RFT Balance");
        // assert( parseInt(await _testDAI.balanceOf(investor1)) == daiMintAmount - 10, "Investor Has Incorrect DAI Balance");
        // await rftSupplyAssertion(0);
        // await daiBalanceContractAssertion(0);

        await fundRaising.unpause({from: admin });
        await fundRaising.invest(10, {from: investor1});
        assert( parseInt(await fundRaising.balanceOf(investor1)) == 20, "Investor Has Incorrect RFT Balance");
        assert( parseInt(await _testDAI.balanceOf(investor1)) == daiMintAmount - 20, "Investor Has Incorrect DAI Balance");
        await rftSupplyChangeAssert(10);
        await daiBalanceContractChangeAssert(10);
    });

    it('Send RFTs for investment (amount != target) if there are enough shares & contract not paused', async () => {

        // Investor 1: Invests 10 Wei of DAI
        // ************************************************************************************     
        await investAssertion( investor1, 10, 100 );
        await rftSupplyChangeAssert(10); // QUESTION: IS AWAIT REALLY NEEDED ON RFTSUPPLYASSERT OR DAIBALANCEASSERT AS WORKED WITHOUT
        await daiBalanceContractChangeAssert(10);
        // ************************************************************************************
    
        // Investor 2: Invests 20 Wei of DAI
        // ************************************************************************************
        await investAssertion( investor2, 20, 100 );
        await rftSupplyChangeAssert(20);
        await daiBalanceContractChangeAssert(20);

        // Investor 3: Invests 30 Wei of DAI
        // ************************************************************************************
        await investAssertion( investor3, 30, 100 ); 
        await rftSupplyChangeAssert(30);
        await daiBalanceContractChangeAssert(30);

        // Admin: Invests 40 Wei of DAI
        // ************************************************************************************
        await investAssertion( admin, 40, 100 ); 
        await rftSupplyChangeAssert(40);
        await daiBalanceContractChangeAssert(40);
    });


});