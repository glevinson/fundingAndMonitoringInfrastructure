// A lot of inspiration from: https://www.youtube.com/watch?v=9CBDj5A-zz4 // async addresses, investor consts, ...

const FundRaising = artifacts.require('FundRaising');
const testDAI = artifacts.require('testDAI');

// require('chai').should();

contract( 'FundRaising', async accounts => {  // is this fine to put async up here
    // Test goes in here

    // const _testDAI = testDAI.new();
    // console.log("Test DAI address: ");
    // console.log(_testDAI);
    // console.log(testDAI.address);
    const maxTestDAI_amount = web3.utils.toWei('10000');
    const [admin, investor1, investor2, investor3, _] = accounts; // Naming the first 4 addresses
    const _name = "Test Project";
    const _symbol = "testP"; // This should applied to the code from the ref below [*]


    // console.log(addresses);
    // console.log("admin: " + admin);
    // console.log("investor 1: " + investor1);
    // console.log("investor 2: " + investor2);
    // console.log("investor 3: " + investor3);

    // beforeEach({
                    // NOTE: This should deploy testDAI and FundRaising!
                    // Reference [*]: 18:45, https://www.youtube.com/watch?v=v90hvMEjf_Q
    // })

    it('Should deploy smart contract properly', async () => {
        const _testDAI = await testDAI.new();
        const fundRaising = await FundRaising.new(10000, "Test Project", "testP", admin, _testDAI.address); // contract instance is a variable that points at a deployed contract
        assert(fundRaising.address !== '');
    });

    it.only('Should allow investment if there are enough shares & contract not paused', async () => {
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

        // Investor 1: Invests 10 Wei of DAI
        // ************************************************************************************
        // await _testDAI.approve(fundRaising.address, 100, {from: investor1});
        // await fundRaising.invest(10, {from: investor1});
        // let rftBalanceInvestor1 = await fundRaising.balanceOf(investor1);
        // let daiBalanceInvestor1 = await _testDAI.balanceOf(investor1);
        // assert( parseInt(rftBalanceInvestor1) == 10, "Investor 1 Has Incorrect RFT Balance");
        // assert( parseInt(daiBalanceInvestor1) == 90, "Investor 1 Has Incorrect DAI Balance");  
        
        console.log("Total supply of RFT 1: " + fundRaising.totalSupply());
        await investAssertion( investor1, 10, 100 );
        console.log("Total supply of RFT 3: " + fundRaising.totalSupply());

        rftSupply = await fundRaising.totalSupply();
        daiBalanceContract = await _testDAI.balanceOf(fundRaising.address);
        assert( rftSupply == 10, "Incorrect supply of RFT");
        assert( daiBalanceContract == 10, "Contract Has Incorrect DAI Balance");
        // ************************************************************************************
    
        // Investor 2: Invests 20 Wei of DAI
        // ************************************************************************************
        await _testDAI.approve(fundRaising.address, 100, {from: investor2});
        await fundRaising.invest(20, {from: investor2});
        let rftBalanceInvestor2 = await fundRaising.balanceOf(investor2);
        let daiBalanceInvestor2 = await _testDAI.balanceOf(investor2);
        assert( parseInt(rftBalanceInvestor2) == 20, "Investor 2 Has Incorrect RFT Balance");
        assert( parseInt(daiBalanceInvestor2) == 80, "Investor 2 Has Incorrect DAI Balance");  
        

        rftSupply = await fundRaising.totalSupply();
        daiBalanceContract = await _testDAI.balanceOf(fundRaising.address);
        assert( rftSupply == 30, "Incorrect supply of RFT");
        assert( daiBalanceContract == 30, "Contract Has Incorrect DAI Balance");

        // Investor 3: Invests 30 Wei of DAI
        // ************************************************************************************
        await _testDAI.approve(fundRaising.address, 100, {from: investor3});
        await fundRaising.invest(30, {from: investor3});
        let rftBalanceInvestor3 = await fundRaising.balanceOf(investor3);
        let daiBalanceInvestor3 = await _testDAI.balanceOf(investor3);
        assert( parseInt(rftBalanceInvestor3) == 30, "Investor 3 Has Incorrect RFT Balance");
        assert( parseInt(daiBalanceInvestor3) == 70, "Investor 3 Has Incorrect DAI Balance");  
        

        rftSupply = await fundRaising.totalSupply();
        daiBalanceContract = await _testDAI.balanceOf(fundRaising.address);
        assert( rftSupply == 60, "Incorrect supply of RFT");
        assert( daiBalanceContract == 60, "Contract Has Incorrect DAI Balance");

        // Admin: Invests 40 Wei of DAI
        // ************************************************************************************
        await _testDAI.approve(fundRaising.address, 100, {from: admin});
        await fundRaising.invest(40, {from: admin});
        let rftBalanceAdmin = await fundRaising.balanceOf(admin);
        let daiBalanceAdmin = await _testDAI.balanceOf(admin);
        assert( parseInt(rftBalanceAdmin) == 40, "Admin Has Incorrect RFT Balance");
        assert( parseInt(daiBalanceAdmin) == 60, "Admin Has Incorrect DAI Balance");  
        

        rftSupply = await fundRaising.totalSupply();
        daiBalanceContract = await _testDAI.balanceOf(fundRaising.address);
        assert( rftSupply == 100, "Incorrect supply of RFT");
        assert( daiBalanceContract == 100, "Contract Has Incorrect DAI Balance");

        // QUESTION: Why doesn't get through await here?
        async function investAssertion(investor, amountInvest, amountApproved) {
            console.log("Entered Invest Assertion");
            await _testDAI.approve(fundRaising.address, amountApproved, {from: investor}); // Doesn't get here?
            await fundRaising.invest(amountInvest, {from: investor});
            console.log("Got here 1");
            let rftBalanceInvestor = await fundRaising.balanceOf(investor1);
            let daiBalanceInvestor = await _testDAI.balanceOf(investor1);
            console.log("Got here 2");
            assert( parseInt(rftBalanceInvestor) == amountInvest, investor + " Has Incorrect RFT Balance");
            assert( parseInt(daiBalanceInvestor) == daiMintAmount - 10, investor +  "Has Incorrect DAI Balance");
            console.log("Got to the end of investAssertion");
            console.log("Total supply of RFT 2 (inside investAssertion): " + fundRaising.totalSupply());
        };
    });
});