// Packages:
//*************************************************************************************************************** */
const express = require('express')
const ethers = require('ethers') // Library for "interacting with the Ethereum Blockchain and its ecosystem" [1]
const{ hexZeroPad } = require('@ethersproject/bytes') // Use to convert tokenID to hexadecimal
const BigNumber = require('bignumber.js');
const app = express()
const port = 3000
//*************************************************************************************************************** */

// ABIs, one for NFT & one for RFT:
//*************************************************************************************************************** */
const abiNFT = [{ "inputs": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "approved", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" }], "name": "ApprovalForAll", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "baseURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "getApproved", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "operator", "type": "address" }], "name": "isApprovedForAll", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "ownerOf", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "bytes", "name": "_data", "type": "bytes" }], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" }], "name": "setApprovalForAll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }], "name": "supportsInterface", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "tokenByIndex", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "tokenOfOwnerByIndex", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "tokenURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]

const abiRFT = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() public view returns (string memory)",

  // Authenticated Functions
  "function transfer(address to, uint amount) returns (bool)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)"
];
//*************************************************************************************************************** */

// Specfifying which blockchain:
const provider = ethers.getDefaultProvider("rinkeby")

// Project MarketPlace contract address (once deployed):
const projectMarketplaceAddress = "0x424d7a8947E558513eF4F900bc2Dab2B42272517"; // Test ProjectMarketplace address on Rinkenby: name: The Sping DAO Project Marketplace Test 1, Symbol: SpringDAOtest1

/* Deployed Test Projects from the above contract on Rinkenby:

  Project 1 data: 1000, "Test Project", "TP1", "Test  Project Token URI" , 0x6B175474E89094C44Da98b954EedeAC495271d0F
            contract address: 0x53F85c097Da547E9BfBf46EDf958f7a6295f2eb3

  Project 2 data: 2000, "Test Project 2", "TP2", "Test  Project 2 Token URI" , 0x6B175474E89094C44Da98b954EedeAC495271d0F
            contract address: 0x81a81f4E331DDE0FD6083ff468Bd033F9a6c50a6

  Project 3 data: 3000, "Test Project 3", "TP3", "Test  Project 3 Token URI" , 0x6B175474E89094C44Da98b954EedeAC495271d0F
            contract address: 0xe8A641b27E947E6545F3A5552b74a9Cd62FC0b4c

  Project 4 data: 4000, "Test Project 4", "TP4", "Test  Project 4 Token URI" , 0x6B175474E89094C44Da98b954EedeAC495271d0F
            contract address: 0xa966b727b2Bf433f566748F44DB8BA69Bb138538
*/

// Creating an instance of the NFT contract - object with  shape of the ABI (has all listed functions) & is deployed on specified network with address you specified
const projectMarketPlace = new ethers.Contract(projectMarketplaceAddress, abiNFT, provider);

// Example data displayed at the home page of the local host at port 3000
app.get('/', (req, res) => {
  res.send([{ name: "bla bla", quantity: 21234 }]) 
})

app.get('/accessData/:sig', async function (req, res) { 
  // ":sig" means <... filled with sig value >, req = request (an object containing info about the HTTP request that raised the event) & res = response (HTTP response)
  /* 
    NB: The signiture is a hash of the message and the users signiture
    By getting the user to sign this particular message, we can deduce their account address which we know to be theirs
    (Rather than user specifying their address - would allow "pretending" to be a different address)
    Signature is calculated off-chain; same for mainnet as Rinkeby & other testnets
  */
  const signingAddress = ethers.utils.verifyMessage("I would like to see my Spring DAO data", req.params.sig); // Finding the users address
  const projectMarketplaceSupply = (await projectMarketPlace.totalSupply()).toNumber() // promise returns {"type":"BigNumber","hex":"0x01"} where 1 is supply at time of testing.
                                                                                       // BigNumber is a ethers data type, .toNumber() converts a BigNumber to a JS 'number' data type

  /* My accounts signiture for this message (verified by etherscan) is: 
     0xb036622d4db705e108c89f67210a2fb1f140a345afe0f6bf8b80ede4ae0b1846462d2d32f68acfa7961bac57c1600331d73521103ed8d4dcabca72e2c1dcc2361c */

  // res.send(("Project MarketPlace Supply: " + projectMarketplaceSupply))

  // res.send(signingAddress)

  // Data that is returned:
  const data = []

  // Iterate through all NFTs and their RFTs - grant access if balance above threshold
  for(let i = 0; i < projectMarketplaceSupply; i++){

    // NEED TO CONVERT TOKENID TO A LARGE INTEGER AND CONVERT THAT TO A HEXADECIMAL STRING (THIS SHOULD BE USEABLE AS THE ADDRESS)
    const tokenID = /*ethers.utils.BigNumber*/(BigInt(await projectMarketPlace.tokenByIndex(i))); // Important to use BigInt here as the address corresponds to a uint256, which allows a magnitude of [.....]
                                                                        // Maximum value supported by javascripts "Number" datatype is 2^53 -1. Although in reality an address is mostly
                                                                        // prefixed by zeros (so tokenID doesn't go above 2^53 -1), it is important that we can cater for one that might
    // data.push("Token index: " + i + " has an ID of: " + tokenID);
    const rftAddress = "0x" + tokenID.toString(16);
    // data.push("rft address of token  " + i + " is " + rftAddress + " and a data type of " + typeof(rftAddress) )
    // const rftAddress = tokenID.toHexString() // Converting NFT tokenID to RFT address

    // data.push((rftAddress) + " " + typeof(rftAddress))
    // const rftAddress = hexZeroPad(tokenID.toHexString(), 20).toLowerCase() // Converting NFT tokenID to RFT address
    const rft = new ethers.Contract(rftAddress, abiRFT, provider);
    data.push("rft " + i + " has a value of " + (await rft.name() )+ " and a data type of " + typeof((await rft.name())))
    // const balanceRFT = (await rft.balanceOf(signingAddress)).toNumber();

  //   if ( projectMarketPlace.ownerOf(tokenID) == signingAddress || balanceRFT >= 0 /* Access Threshold */ ){ // I.e. if user owns the NFT itself or has above threshold of RFT...
  //     // Project Name, save images to a google drive and heres the link
  //     // const projectName = await nft.tokenURI( tokenID )
  //     // ata.push(tokenURI) // NB: DATA SGtokenURI 
  //     const projectName = await projectMarketPlace.getName();
  //     data.push(" < " + projectName + " > Data ") // NB: DATA SGtokenURI 
  //     // data["<Project Name>"] = "https://www.facebook.com/pages/category/Food---beverage/Fasdfasd-2407435632608750/"
  //   }
  }
  res.send(data)
  // res.send(data)
});

// Now I have address of user (i.e. know this user is for real/verified)
// So need to go through their tokens; iterate through all the nft projects, for each project convert NFT ID to RFT address, getbalance of each RFT

// Now:
// Need a provider to read from blockchain: https://docs.ethers.io/v5/api/providers/ - connects to blockchain

//springdao.com/dataAccess?user=0x0eE704107ccDf5Ec43B17152A37afF8Ee4BdE93d&signature=0x342432423534534534534534523423423

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

//*************************************************************************************************************** */
// References:
// [1] - https://docs.ethers.io/v5/
