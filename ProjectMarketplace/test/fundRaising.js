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

    async function investAssertion(investor, amountInvest, amountApproved) => {
        await _testDAI.approve(fundRaising.address, amountApproved, {from: investor});
        await fundRaising.invest(amountInvest, {from: investor});
        let rftBalanceInvestor = await fundRaising.balanceOf(investor1);
        let daiBalanceInvestor = await _testDAI.balanceOf(investor1);
        assert( parseInt(rftBalanceInvestor) == 10, "Investor 1 Has Incorrect RFT Balance");
        assert( parseInt(daiBalanceInvestor) == 90, "Investor 1 Has Incorrect DAI Balance");        
    };

    it.only('Should allow investment if there are enough shares & contract not paused', async () => {
        const _testDAI = await testDAI.new();
        const fundRaising = await FundRaising.new(web3.utils.toWei('10000'), "Test Project", "testP", admin, _testDAI.address); // contract instance is a variable that points at a deployed contract
        await Promise.all([
            _testDAI.mint(admin, 100 ),
            _testDAI.mint(investor1, 100 ),
            _testDAI.mint(investor2, 100 ),
            _testDAI.mint(investor3, 100 )
        ]);
        let rftSupply = await fundRaising.totalSupply();
        let daiBalanceContract = await _testDAI.balanceOf(fundRaising.address);
        assert(rftSupply == 0);
        assert(daiBalanceContract == 0);

        await _testDAI.approve(fundRaising.address, 100, {from: investor1});
        await fundRaising.invest(10, {from: investor1});
        let rftBalanceInvestor1 = await fundRaising.balanceOf(investor1);
        let daiBalanceInvestor1 = await _testDAI.balanceOf(investor1);
        assert( parseInt(rftBalanceInvestor1) == 10, "Investor 1 Has Incorrect RFT Balance");
        assert( parseInt(daiBalanceInvestor1) == 90, "Investor 1 Has Incorrect DAI Balance");        

        rftSupply = await fundRaising.totalSupply();
        daiBalanceContract = await _testDAI.balanceOf(fundRaising.address);
        assert( parseInt(rftSupply) == 10, "Incorrect supply of RFT");
        assert( parseInt(daiBalanceContract) == 10, "Contract Has Incorrect DAI Balance");
    




        // let z = await _testDAI.balanceOf(fundRaising.address);

        // assert( parseInt(balanceContract) == 10, "First investment not recieved");
        // assert( parseInt(balanceInvestor1) == 10, "First investor hasn't recieved tokens");

        // (await fundRaising.balanceOf(investor1)).should.equal(90); 
        // assert( Object.values((await parseInt(fundRaising.balanceOf(investor1)))) == 90, "First investor hasn't recieved tokens");
        // assert( (await _testDAI.balanceOf(fundRaising.address))  == 10, "First investment not recieved");

        // await _testDAI.approve(fundRaising.address, maxTestDAI_amount, {from: investor2});
        // await fundRaising.invest(web3.utils.toWei('2000'), {from: investor2});
        // assert(_testDAI.balanceOf(fundRaising.address) == web3.utils.toWei('2000'), "Second investment not recieved");
        // assert(fundRaising.balanceOf(investor1) == web3.utils.toWei('2000'), "Second investor hasn't recieved tokens");

        // await _testDAI.approve(fundRaising.address, maxTestDAI_amount, {from: investor3});
        // await fundRaising.invest(web3.utils.toWei('3000'), {from: investor3});
        // assert(_testDAI.balanceOf(fundRaising.address) == web3.utils.toWei('3000'), "Third investment not recieved");
        // assert(fundRaising.balanceOf(investor1) == web3.utils.toWei('3000'), "Third investor hasn't recieved tokens");

        // await _testDAI.approve(fundRaising.address, maxTestDAI_amount, {from: admin});
        // await fundRaising.invest(web3.utils.toWei('4000'), {from: admin});
        // assert(_testDAI.balanceOf(fundRaising.address)  == web3.utils.toWei('4000'), "Admin's investment not recieved");
        // assert(fundRaising.balanceOf(investor1) == web3.utils.toWei('4000'), "Admin hasn't recieved tokens");
    });
});
// In here can use before() hook and it() for defining tests [ more info: mochajs.ord]

// Separate contract blocks => independent tests

// need to put the contrsuctors in