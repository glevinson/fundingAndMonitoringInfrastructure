
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
    async function investAssert(investor, amountInvest) {
        
        let rftBalanceInvestorBefore = await fundRaising.balanceOf(investor);
        let daiBalanceInvestorBefore = await _testDAI.balanceOf(investor);

        await fundRaising.invest(amountInvest, {from: investor});

        let rftBalanceInvestor = await fundRaising.balanceOf(investor);
        // console.log("RFT balance of investor: " + rftBalanceInvestor.toNumber());
        let daiBalanceInvestor = await _testDAI.balanceOf(investor); // QUESTION: .toNumber() better than Parse?
        // console.log("rft balance using .toNumber(), daibalinv = " + daiBalanceInvestor.toNumber() + " & with type: " + typeof(daiBalanceInvestor.toNumber()));
        assert( parseInt(rftBalanceInvestor - rftBalanceInvestorBefore) == amountInvest, "Investor Has Incorrect RFT Balance");
        assert( parseInt(daiBalanceInvestor - daiBalanceInvestorBefore) == -amountInvest, "Investor Has Incorrect DAI Balance");
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

        await Promise.all([
            _testDAI.approve(fundRaising.address, daiMintAmount, {from: admin} ),
            _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor1} ),
            _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor2} ),
            _testDAI.approve(fundRaising.address, daiMintAmount, {from: investor3} )
        ]);
    })

    it/*.only*/('Should deploy smart contract properly', async () => {
        assert(fundRaising.address !== '');
    });

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
        // Tests ensuring no transactions successful for investor 1
        assert( parseInt(await fundRaising.balanceOf(investor1)) == 10, "Investor 1 Has Incorrect RFT Balance");
        assert( parseInt(await _testDAI.balanceOf(investor1)) == daiMintAmount - 10, "Investor 1 Has Incorrect DAI Balance");
        await rftSupplyChangeAssert(0);
        await daiBalanceContractChangeAssert(0);

        // Contract unpaused - can invest
        // ***************************************************************************
        await fundRaising.unpause({from: admin });
        await investAssert(investor1, 10);
        // await rftSupplyChangeAssert(10);
        // await daiBalanceContractChangeAssert(10);
    });

    // it('Not allow ')

    it.only('Send RFTs for investment (amount != target) if there are enough shares & contract not paused', async () => {

        // Investor 1: Invests 10 Wei of DAI
        // ************************************************************************************     
        await investAssert( investor1, 10 );
        await rftSupplyChangeAssert(10); // QUESTION: IS AWAIT REALLY NEEDED ON RFTSUPPLYASSERT OR DAIBALANCEASSERT AS WORKED WITHOUT
        await daiBalanceContractChangeAssert(10);
        // ************************************************************************************

        // Investor 1: Invests 10 Wei of DAI
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