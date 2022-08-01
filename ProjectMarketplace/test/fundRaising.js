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
        await Promise.all([
            _testDAI.mint(admin, 100 ),
            _testDAI.mint(investor1, 100 ),
            _testDAI.mint(investor2, 100 ),
            _testDAI.mint(investor3, 100 )
        ]);
        console.log("Balance of DAI of Investor 1 BEFORE investment: " + await _testDAI.balanceOf(investor1));
        console.log("Balance of DAI of Fundraising contract BEFORE investment: " + await _testDAI.balanceOf(fundRaising.address));
        await _testDAI.approve(fundRaising.address, 100, {from: investor1});
        await fundRaising.invest(10, {from: investor1});
        console.log("Balance of DAI of Investor 1 AFTER investment: " + await _testDAI.balanceOf(investor1));
        console.log("Balance of DAI of Fundraising contract AFTER investment: " + await _testDAI.balanceOf(fundRaising.address));
        
        let balanceInvestor1 = await fundRaising.balanceOf(investor1); // The number of RFT investor 1 has
        let mintedTokens = await fundRaising.totalSupply(); // The total number of RFTs in circulation
        let contractsDAI_balance = await _testDAI.balanceOf(fundRaising.address); // The DAI balance of FundRaising contract
        let investor1_DAI_balance = await _testDAI.balanceOf(investor1); // The DAI balance of investor 1
      
        assert( parseInt(balanceInvestor1) == 10, "First investor hasn't recieved tokens");
        assert( parseInt(mintedTokens) == 10, "RFT tokens not created");
        assert( parseInt(contractsDAI_balance) == 10, "First investment not recieved by contract");
        assert( parseInt(investor1_DAI_balance) == 90, "Investor 1 not billed correctly");

        // console.log("x is: " + x + " & type: " + typeof(x));
        // console.log("90 is: " + 10 + " & type: " + typeof(10));
        // console.log("x (parseInt) is: " + parseInt(x) + " & type: " + typeof(parseInt(x)));
        // console.log("My manipulated x is: " + x.toString() + " & type: " + typeof(x));


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