// Packages:
//*************************************************************************************************************** */
const express = require('express');
const ethers = require('ethers');
const app = express();
const port = 8000;
const fetch = require('node-fetch');
const cors = require('cors');
app.use(cors());
//*************************************************************************************************************** */

// ABIs, one for NFT & one for RFT:
//*************************************************************************************************************** */
const abiNFT = [{ "inputs": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "approved", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" }], "name": "ApprovalForAll", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "baseURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "getApproved", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "operator", "type": "address" }], "name": "isApprovedForAll", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "ownerOf", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "bytes", "name": "_data", "type": "bytes" }], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" }], "name": "setApprovalForAll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }], "name": "supportsInterface", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "tokenByIndex", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "tokenOfOwnerByIndex", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "tokenURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]

const abiRFT = [
  "function balanceOf(address owner) view returns (uint256)",
  "function name() public view returns (string memory)",   
  "function totalSupply() public view returns (uint256)",
  "function amountRaised() public view returns (uint256)",
  "function istargetRaised() public view returns (bool)",
  "function dataAccessThreshold() public view returns (uint256)"
]

// Storing mock data in a map (purely for proof of concept)
// These images are stored on image hosting website/server @ https://augustus-levinso.imgbb.com/
//*************************************************************************************************************** */
const dataMap = new Map();

dataMap.set('Water System: Adwumakase Kese, Ghana', "https://i.ibb.co/R9gq2k6/Adwumakase-Kese-Ghana.png");
dataMap.set('Water System: Endanachan, Tanzania', "https://i.ibb.co/GHNScvW/Endanachan-Tanzania.png");
dataMap.set('Water System: Jarreng, The Gambia', "https://i.ibb.co/RCcNw2k/Jarreng-The-Gambia.png");
dataMap.set('Water System: Ndemban, The Gambia', "https://i.ibb.co/PzyyvWR/Ndemban-The-Gambia.png");

//*************************************************************************************************************** */

// Specfifying which blockchain:
const provider = ethers.getDefaultProvider("rinkeby")

const projectMarketplaceAddress = "0xF7c86f0648272b8A1F8ff6b34365af55dEcBA41C";

// Creating an instance of the NFT contract
const projectMarketPlace = new ethers.Contract(projectMarketplaceAddress, abiNFT, provider);

app.get('/', (req, res) => {
  res.json("Backend Local Server");
})

// Contains authenticatio mechanism:
app.get('/accessData/', async function (req, res) {

  try {
    const sig = req.query.signature;
    const signingAddress = ethers.utils.verifyMessage("I would like to see my Spring DAO data", sig);
    const projectMarketplaceSupply = (await projectMarketPlace.totalSupply()).toNumber() 

    // Data that we will return
    const data = []

    // Iterate through all project's granting user access if they hold sufficient tokens
    for (let i = 0; i < projectMarketplaceSupply; i++) {

      // Use BigInt in line 64 as precaution against overflow (tokenID is 256-bit unisgned integer)
      const tokenID = (BigInt(await projectMarketPlace.tokenByIndex(i)));
      const rftAddress = "0x" + tokenID.toString(16);
      const rft = new ethers.Contract(rftAddress, abiRFT, provider);
      const balanceRFT = (await rft.balanceOf(signingAddress));
      const threshold = ethers.BigNumber.from(await rft.dataAccessThreshold());

      // Grant access if user owns project NFT itself or has at least the data access threshold of RFTs
      if (  (await projectMarketPlace.ownerOf(tokenID)) == signingAddress || balanceRFT.gte(threshold) ){
        const projectName = await rft.name();
        data.push({ name: projectName, url: dataMap.get(projectName) })
      }

      // If user owns some of the project's RFTs, but not enough to view the project data
      else if ( balanceRFT.gt(0) ){ 
        const projectName = await rft.name();
        data.push({ name: projectName, url: null })
      }
    }
    if (data.length == 0){
      data.push(null)
    }
    res.json(data)
  }
  catch (e) {
    console.error("Error: ", e)
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

