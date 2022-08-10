// A lot of inspiration from: https://www.youtube.com/watch?v=9CBDj5A-zz4 // async addresses, investor consts, ...
const testERC721 = artifacts.require('testERC721');
const Fundraising = artifacts.require('Fundraising');
const ProjectMarketPlace = artifacts.require('ProjectMarketplace');
const testDAI = artifacts.require('testDAI');
const truffleAssert = require('truffle-assertions');

contract('Fundraising', async accounts => {  // is this fine to put async up here

    const maxTestDAI_amount = web3.utils.toWei('10000');
    const [admin, investor1, investor2, investor3, _] = accounts; // Naming the first 4 addresses

    const _name = "Test Project";
    const _symbol = "testP"; // This should applied to the code from the ref below [*]
    let targetAmount = 1000;
    let dataAccessThreshold = 50 // Equivalent to $50
    let _tokenURI = "Test Project URI"

    let _testDAI;
    let fundraising; // Not sure how to make consts
    const daiMintAmount = 1000;
    let tokenID;
    let projectMarketPlace;

    //********************************************************************************************************* */
    beforeEach('Deploy Contract', async () => {
        // Reset testDAI and Fundraising for each test:
        _testDAI = await testDAI.new();
        projectMarketPlace = await ProjectMarketPlace.new();

        tokenID = await projectMarketPlace.createProject.call(targetAmount, _name, _symbol, _tokenURI, dataAccessThreshold, _testDAI.address); // call this but dont actually do transaction, simulate the transaction and give me just the return, without call it would return the transaction
        await projectMarketPlace.createProject(targetAmount, _name, _symbol, _tokenURI, dataAccessThreshold, _testDAI.address);
        const fundraisingAddress = "0x" + tokenID.toString(16);
        fundraising = await Fundraising.at(fundraisingAddress);
    })

    describe('Contract Initialisation', function () {

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
        })

        it('Correct DAI Address', async () => {
            const testDaiAddress = (await fundraising.coin());
            assert(_testDAI.address == testDaiAddress, 'Incorrect Test DAI Address')
        })

        it('Has 0 DAI Balance', async () => {
            const daiBalance = (await _testDAI.balanceOf(fundraising.address)).toNumber();
            assert(daiBalance == 0, 'Incorrect DAI Balance');
        });

        it('Has 0 RFT Supply', async () => {
            const rftSupply = (await fundraising.totalSupply()).toNumber();
            assert(rftSupply == 0, 'Incorrect RFT Supply');
        });

        it('Is Paused', async () => {
            const paused = await fundraising._paused();
            assert(!paused, 'Contract Initiallised Paused');
        });

        describe('Pause Function', function () {

            it('Admin can pause', async () => {
                await fundraising.pause({ from: admin });
                const paused = await fundraising._paused();
                assert(paused, "Admin Cannot Pause");
            });

            it('Admin can unpause', async () => {
                await fundraising.pause({ from: admin });
                await fundraising.unpause({ from: admin });
                const paused = await fundraising._paused();
                assert(!paused, "Admin Cannot Unpause");
            });

            it('Non-admin cannot pause', async () => {
                await truffleAssert.reverts(
                    fundraising.pause({ from: investor1 }), "Only Admin Can Pause/Unpause");
            });

            it('Non-admin cannot unpause', async () => {
                await fundraising.pause({ from: admin });
                await truffleAssert.reverts(
                    fundraising.unpause({ from: investor1 }), "Only Admin Can Pause/Unpause");
            });
        });

    });

    describe('Investing', function () {

        beforeEach('Mint DAI & Approve Spending', async () => {

            await Promise.all([
                _testDAI.mint(investor1, daiMintAmount),
                _testDAI.mint(investor2, daiMintAmount),
                _testDAI.mint(investor3, daiMintAmount)
            ]);

            await Promise.all([
                _testDAI.approve(fundraising.address, daiMintAmount, { from: investor1 }),
                _testDAI.approve(fundraising.address, daiMintAmount, { from: investor2 }),
                _testDAI.approve(fundraising.address, daiMintAmount, { from: investor3 })
            ]);
        })

        describe('Invest Function', function () {
            let amountInvest;

            context('Contract unpaused', function () {
                context('Enough Tokens Available', function () {
                    context('Target Not Raised', function () {

                        beforeEach('Investment', async () => { // This occurs before the higher level 'BeforeEach', it goes lower level before, upper level before each, lower level before each, test, upperlevel before each, lower lever before each, test, etc...
                            amountInvest = 10;
                            await fundraising.invest(amountInvest, { from: investor1 });
                        })

                        // Not sure this test neccessary:
                        it('Investor Charged Correct DAI', async () => {
                            let daiBalanceInvestor = (await _testDAI.balanceOf(investor1)).toNumber();
                            assert(daiBalanceInvestor - daiMintAmount == - amountInvest, 'Investor Charged Incorrect DAI');
                        });

                        it('Contract Recieves Correct DAI', async () => {
                            let daiBalanceContract = (await _testDAI.balanceOf(fundraising.address)).toNumber();
                            assert(daiBalanceContract == amountInvest);
                        });

                        it('Investor Recieves Correct RFTs', async () => {
                            let rftBalanceInvestor = (await fundraising.balanceOf(investor1)).toNumber();
                            assert(rftBalanceInvestor == amountInvest);
                        });

                        // Not sure this test neccessary:
                        it('RFT Supply Increased Correctly', async () => {
                            let rftSupply = (await fundraising.totalSupply()).toNumber();
                            assert(rftSupply == amountInvest);
                        });

                        it('Send Funds To Admin Once Target Raised', async () => {
                            // Raise Funds to target:
                            await fundraising.invest(targetAmount - amountInvest, { from: investor3 });

                            let daiBalanceContract = (await _testDAI.balanceOf(fundraising.address)).toNumber();
                            let daiBalanceAdmin = (await _testDAI.balanceOf(admin)).toNumber();
                            assert(daiBalanceContract == 0);
                            assert(daiBalanceAdmin == targetAmount); // Change so admin doesnt get dai
                        });
                    });

                    context('Target Raised', function () {

                        it('Cannot Invest', async () => {
                            await fundraising.invest(500, { from: investor1 });
                            await fundraising.invest(500, { from: investor2 });
                            await truffleAssert.reverts(
                                fundraising.invest(1, { from: investor1 }), "Target Already Raised");
                        });
                    });
                });
            });

            context('Not Enough Tokens Available', function () {

                it('Cannot invest', async () => {
                    // Target Amount Initiallised to 1000
                    await fundraising.invest(900, { from: investor1 });
                    await truffleAssert.reverts(
                        fundraising.invest(110, { from: investor2 }), "Not enough shares left!");
                });
            });
            context('Contract Paused', function () {

                it('Cannot invest', async () => {
                    fundraising.pause();
                    await truffleAssert.reverts(
                        fundraising.invest(1, { from: investor1 }), "Contract Is Paused");
                });
            });
        });

        describe('Withdraw Investment Function', function () {

            context('Withdrawal Value <= Amount Invested', function () {

                beforeEach('Invest & Withdraw Investment', async () => { // This occurs before the higher level 'BeforeEach', it goes lower level before, upper level before each, lower level before each, test, upperlevel before each, lower lever before each, test, etc...
                    amountInvest = 20;
                    await fundraising.invest(amountInvest, { from: investor1 });
                    await fundraising.withdrawInvestment(amountInvest, { from: investor1 });
                });

                it('Investor Returned Correct DAI', async () => {
                    let daiBalanceInvestor = (await _testDAI.balanceOf(investor1)).toNumber();
                    assert(daiBalanceInvestor == daiMintAmount, 'Investor Charged Incorrect DAI');
                });

                it('Contract Sends Correct DAI', async () => {
                    let daiBalanceContract = (await _testDAI.balanceOf(fundraising.address)).toNumber();
                    assert(daiBalanceContract == 0);
                });

                it('Investor Charged Correct RFTs', async () => {
                    let rftBalanceInvestor = (await fundraising.balanceOf(investor1)).toNumber();
                    assert(rftBalanceInvestor == 0);
                });

                it('RFT Supply Decreased Correctly', async () => {
                    let rftSupply = (await fundraising.totalSupply()).toNumber();
                    assert(rftSupply == 0);
                });
            });

            context('Withdrawal Value > Amount Invested', function () {
                it('Cannot Withdraw', async () => {
                    amountInvest = 20;
                    await fundraising.invest(amountInvest, { from: investor1 });
                    await truffleAssert.reverts(
                        fundraising.withdrawInvestment((amountInvest + 1), { from: investor1 }));
                });
            });

            context('Target Raised', function () {
                it('Cannot Withdraw Investment', async () => {
                    await fundraising.invest(500, { from: investor1 });
                    await fundraising.invest(500, { from: investor2 });
                    await truffleAssert.reverts(
                        fundraising.withdrawInvestment(500, { from: investor1 }), "Target Already Raised");
                    await truffleAssert.reverts(
                        fundraising.withdrawInvestment(500, { from: investor2 }), "Target Already Raised");
                });
            });
        });

        describe('Redeem NFT Function', function () {

            context('Single Investor Invests Target Amount (Owns Total RFT Supply)', function () {

                beforeEach('Invest Full Target Amount', async () => {
                    await fundraising.invest(targetAmount, { from: investor1 });
                    await fundraising.redeemNFT({ from: investor1 });
                })

                it('RFTs burned', async () => {
                    assert((await fundraising.totalSupply()) == 0)
                })

                it('NFT Transfered to Investor', async () => {
                    const nftOwner = await projectMarketPlace.ownerOf(tokenID)
                    assert(nftOwner == investor1);
                })
            })

            context('Single Investor Does Not Invest Target Amount (Not Own Total RFT Supply)', async () => {

                it('Cannot Redeem', async () => {
                    await fundraising.invest(500, { from: investor1 })
                    await fundraising.invest(500, { from: investor2 })
                    await truffleAssert.reverts(
                        fundraising.redeemNFT({ from: investor1 }), "Do Not Have RFT Total Supply")
                    await truffleAssert.reverts(
                        fundraising.redeemNFT({ from: investor1 }), "Do Not Have RFT Total Supply")
                })
            });
        });
    });
});