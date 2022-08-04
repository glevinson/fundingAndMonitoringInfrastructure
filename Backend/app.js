// Packages:
//*************************************************************************************************************** */
const express = require('express')
const ethers = require('ethers') // Library for "interacting with the Ethereum Blockchain and its ecosystem" [1]
const{ hexZeroPad } = require('@ethersproject/bytes') // Use to convert tokenID to hexadecimal
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

  // Authenticated Functions
  "function transfer(address to, uint amount) returns (bool)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)"
];
//*************************************************************************************************************** */

// Specfifying which blockchain:
const provider = ethers.getDefaultProvider(/*"rinkeby"*/) // PROVIDER IS RINKENBY

// Project MarketPlace contract address (once deployed):
const projectMarketplaceAddress = "0x764a06fDdcE6b8895b6E7F9ba2874711BF31edEa"; // NFT ADDRESS IS ON RINKEBY

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
  */
 // SIGNATURE IS ON MAINNET
  const signingAddress = ethers.utils.verifyMessage("I would like to see my Spring DAO data", req.params.sig); // Finding the users address
  // const projectMarketplaceSupply = (await projectMarketPlace.totalSupply()).toNumber()

  res.send(signingAddress)

  // // Data that is returned:
  // const data = []

  // // Iterate through all NFTs and their RFTs - grant access if balance above threshold
  // for(let i = 0; i < projectMarketplaceSupply; i++){

  //   let tokenID = await projectMarketPlace.tokenByIndex(i);

  //   const rftAddress = hexZeroPad(tokenID.toHexString(), 20).toLowerCase() // Converting NFT tokenID to RFT address
  //   const rft = new ethers.Contract(rftAddress, abiRFT, provider);
  //   const balanceRFT = (await rft.balanceOf(signingAddress)).toNumber();

  //   if ( projectMarketPlace.ownerOf(tokenID) == signingAddress || balanceRFT >= 0 /* Access Threshold */ ){ // I.e. if user owns the NFT itself or has above threshold of RFT...
  //     // Project Name, save images to a google drive and heres the link
  //     // const projectName = await nft.tokenURI( tokenID )
  //     // ata.push(tokenURI) // NB: DATA SGtokenURI 
  //     const projectName = await projectMarketPlace.getName();
  //     data.push(" < " + projectName + " > Data ") // NB: DATA SGtokenURI 
  //     // data["<Project Name>"] = "https://www.facebook.com/pages/category/Food---beverage/Fasdfasd-2407435632608750/"
  //   }
  // }
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
