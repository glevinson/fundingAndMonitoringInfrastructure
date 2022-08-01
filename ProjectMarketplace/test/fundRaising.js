// A lot of inspiration from: https://www.youtube.com/watch?v=9CBDj5A-zz4 // async addresses, investor consts, ...

const FundRaising = artifacts.require('FundRaising');
const testDAI = artifacts.require('testDAI');

require('chai');

contract( 'FundRaising', async accounts => {  // is this fine to put async up here

    const maxTestDAI_amount = web3.utils.toWei('10000');
    const [admin, investor1, investor2, investor3, _] = accounts; // Naming the first 4 addresses
    const _name = "Test Project";
    const _symbol = "testP"; // This should applied to the code from the ref below [*]

    // beforeEach({
                    // NOTE: This should deploy testDAI and FundRaising!
                    // Reference [*]: 18:45, https://www.youtube.com/watch?v=v90hvMEjf_Q
    // })

    beforeEach('Setup FundRaising', async () => {
        this._testDAI = await testDAI.new(); // QUESTION: For some reason only working with "this.", how do with const instead?
        this.fundRaising = await FundRaising.new(10000, "Test Project", "testP", admin, this._testDAI.address); // contract instance is a variable that points at a deployed contract
    })

    it.only('Should deploy smart contract properly', async () => {
        // const this_testDAI = await testDAI.new();
        // const fundRaising = await FundRaising.new(10000, "Test Project", "testP", admin, _testDAI.address); // contract instance is a variable that points at a deployed contract
        assert(this.fundRaising.address !== '');
    });

    it('Should allow investment (under target) if there are enough shares & contract not paused', async () => {
        const _testDAI = await testDAI.new();
        const fundRaising = await FundRaising.new(web3.utils.toWei('10000'), "Test Project", "testP", admin, _testDAI.address); // contract instance is a variable that points at a deployed contract
        const daiMintAmount = 100;

        await Promise.all([
            _testDAI.mint(admin, daiMintAmount ),
            _testDAI.mint(investor1, daiMintAmount ),
            _testDAI.mint(investor2, daiMintAmount ),
            _testDAI.mint(investor3, daiMintAmount )
        ]);
        let rftSupply = await fundRaising.totalSupply();
        let daiBalanceContract = await _testDAI.balanceOf(fundRaising.address);
        assert(rftSupply == 0);
        assert(daiBalanceContract == 0);

        /* Approves the fundraising contract for an investor for a specified amount ('amountApproved')
        // and invests another specified amount ('amountInvest') */
        // ************************************************************************************     
        async function investAssertion(investor, amountInvest, amountApproved) {
            await _testDAI.approve(fundRaising.address, amountApproved, {from: investor});
            await fundRaising.invest(amountInvest, {from: investor});

            let rftBalanceInvestor = await fundRaising.balanceOf(investor);
            let daiBalanceInvestor = await _testDAI.balanceOf(investor);

            assert( parseInt(rftBalanceInvestor) == amountInvest, "Investor Has Incorrect RFT Balance");
            assert( parseInt(daiBalanceInvestor) == daiMintAmount - amountInvest, "Investor Has Incorrect DAI Balance");
        };

        // Investor 1: Invests 10 Wei of DAI
        // ************************************************************************************     
        await investAssertion( investor1, 10, 100 );

        rftSupply = await fundRaising.totalSupply();
        daiBalanceContract = await _testDAI.balanceOf(fundRaising.address);
        assert( rftSupply == 10, "Incorrect supply of RFT");
        assert( daiBalanceContract == 10, "Contract Has Incorrect DAI Balance");
        // ************************************************************************************
    
        // Investor 2: Invests 20 Wei of DAI
        // ************************************************************************************
        await investAssertion( investor2, 20, 100 );
        
        rftSupply = await fundRaising.totalSupply();
        daiBalanceContract = await _testDAI.balanceOf(fundRaising.address);
        assert( rftSupply == 30, "Incorrect supply of RFT");
        assert( daiBalanceContract == 30, "Contract Has Incorrect DAI Balance");

        // Investor 3: Invests 30 Wei of DAI
        // ************************************************************************************
        await investAssertion( investor3, 30, 100 ); 
        
        rftSupply = await fundRaising.totalSupply();
        daiBalanceContract = await _testDAI.balanceOf(fundRaising.address);
        assert( rftSupply == 60, "Incorrect supply of RFT");
        assert( daiBalanceContract == 60, "Contract Has Incorrect DAI Balance");

        // Admin: Invests 40 Wei of DAI
        // ************************************************************************************
        await investAssertion( admin, 40, 100 ); 
        
        rftSupply = await fundRaising.totalSupply();
        daiBalanceContract = await _testDAI.balanceOf(fundRaising.address);
        assert( rftSupply == 100, "Incorrect supply of RFT");
        assert( daiBalanceContract == 100, "Contract Has Incorrect DAI Balance");
    });


});