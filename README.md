# About the Project
This repository contains the technical architecture for my MSc Computing thesis at Imperial College London: 'DAOs for Funding & Monitoring Infrastructure in Developing Countries'. I propose a novel financing pathway for building infrastructure in developing countries that is faster and offers greater accountability than existing approaches. My work recieved a distinction (75%) and is under publication.

I designed and developed an ecosystem of Ethereum smart contracts, in Solidity, that enables users to create on-chain fundraises for infrastructure projects using stablecoins. These smart contracts are in the [ProjectMarketplace](ProjectMarketplace) directory. I also developed a web application, written in JavaScript, that enables investors to monitor their projects using data that project proposers are required to supply. This web app can be found in the [App](App) directory. Please view the [final report](final_report.pdf) for more information.

## Background: Re-fungible token (RFT)
In the description of this system, I make reference to Re-fungible tokens or "RFTs". RFTs represent making the ownership of non-fungible tokens divisble. The concept is to have an ERC-721 NFT which is owned by a fungible token contract, such as an ERC-20, with a limited fungible token supply. The fungible tokens represent the shared ownership of the NFT held by the fungible token contract and are referred to as RFTs. One RFT is equivalent to $\frac{1}{supply}$ proportional ownership of the corresponding NFT.

# Fundraising System
There are 3 main components:

1. 'ProjectMarketplace': ERC-721 compliant smart contract for project proposers to interact with
2. 'Fundraising': ERC-20 compliant smart contract that represents a project's fundraise and is interacted with by investors
3. 'Project NFTs': represents project and its ownership

## How to Use
You can either interact with a mock system that I have deployed on the Ethereum Goerli testnet or deploy your own.

### Deployed Mock System
I have deployed a ProjectMarketplace smart contract and created 3 mock project fundraises on the Ethereum Goerli testnet. These can be viewed on [OpenSea](https://testnets.opensea.io/collection/the-springdao-projectmarketplace-v2). Funds are raised in ['testUSDT'](ProjectMarketplace/contracts/testUSDT.sol); a ERC-20 token whose contract you can freely mint from. The system currently has these addresses:

- ProjectMarketplace: 0xd7bb862c137906160045814766af449A10c1FDFB
- 'Water System: Endanachan, Tanzania' Project Fundraise: 0x832d15990cE4C5EA34424A1CA22b325daA635Dbb
- 'Water System: Ndemban, The Gambia' Project Fundraise: 0xB46564A057AA2B9Efe7785EdeeA57d2677c18857
- 'Water System: Adwumakase Kese, Ghana' Project Fundraise: 0x832d15990cE4C5EA34424A1CA22b325daA635Dbb
- testUDT: 0xdcE77e597F228D7352eFD4aaF4185118BaE210cE

### Creating On-chain Infrastructure Project Fundraises
You can create a project by calling the 'createProject' function in the [ProjectMarketplace](ProjectMarketplace/contracts/ProjectMarketplace.sol) smart contract. You must specify the details of the project in the function’s parameters, such as the name of the project, the amount it is aiming to raise, the cryptocurrency that funds are raised in (must be ERC-20 based) and the ‘data access threshold’ (minimum amount of investment required to view a project’s data). When ‘createProject’ is called, a [Fundraising](ProjectMarketplace/contracts/Fundraising.sol) smart contract is deployed and a NFT minted which is owned by the Fundraising contract. The NFT represents the project and its ownership.

When a new project is created, view the transaction on Etherscan to obtain the address of the deployed Fundraising smart contract. The corresponding Fundraising contract address is the address that the newly minted ERC-721 project NFT has been transferred to.

### Investing in Project Fundraises
To invest in a project's Fundraising smart contract you must first go to the smart contract of the ERC-20 that funds are being raised in and approve the Fundraising contract's address. You can then interact with the Fundraising contract's investment functions. In return for investment, users receive the Fundraising contract’s ERC-20 tokens in a 1:1 ratio to the net value of their contribution. This means a Fundraising smart contract's supply limit equals the amount that the project is aiming to raise. 

As the Fundraising smart contract owns the project NFT, the token that the contract mints represent a share of the project NFT’s ownership and, thus, the project itself. Tokens minted by a Fundraising contract can therefore be referred to as re-fungible tokens (RFTs) as they enable the ownership of a successfully fund raised ProjectNFT to be divisible. Each RFT can be thought of as $\frac{1}{target amount}$ proportional ownership of the project NFT and, therefore, the project itself. 

# Monitoring Project Data

## Access Control Module
The 'data access threshold' is set by the project creator and is the minimum value a user must invest in order to view a project's data. Access is granted by a access control module which was developed in JavaScript using the Express.js framework and Ethers library. As investment into a project is represented by ownership of the project’s RFTs or NFT, the access control mechanism uses these tokens to grant access to the project’s data. The module is passed the user’s signature of a message and the message’s contents as parameters. It then determines the user’s Ethereum account address. By interacting with the ‘ProjectMarketplace’ smart contract, it iterates through all the successfully fundraised projects and adds the name of a proect to an array (initialised empty) if the user holds at least the data access threshold of corresponding RFTs or the project NFT itself.

## Web application
In order to demonstrate the data access control module, I built a web app that contains it in its [backend](App/Backend/). When prompted, the web app displays the names of projects that the user has invested over the 'data access threshold'. When a user requests to view their project data, they are prompted to sign a message with a cryptocurrency wallet (such a wallet must be installed). The signature is passed as a parameter to the back-end in a GET request. The signature and contents of the message signed are then passed to the access control mechanism. The project names that access is granted to is then returned by the access control module to the frontend and displayed on the user interface. It is assumed that project names are unique.


## Installation
1. Clone the repo
   ```sh
   git clone https://github.com/glevinson/fundingAndMonitoringInfrastructure.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```

## How to use
1. Open terminal window
2. Run backend
  ```sh
  cd <Backend directory>
  npm run start
  ```
3. Open another terminal window
4. Run localhost
  ```sh
  cd < Frontend directory >
  npm run start
  ```

You will now be able to interact with the app at http://localhost:3000/

# Outcomes

## Publication
My thesis is under publication in the ACM acadmeic journal: ['Distributed Ledger Technology: Research and Practice'](https://dl.acm.org/journal/dlt), with the co-authors: [Dr Catherine Mulligan](https://www.imperial.ac.uk/people/c.mulligan), the ‘European Research Area Chair in Blockchain’, and [Professor William Knottenbelt](https://www.imperial.ac.uk/people/w.knottenbelt), Director of the ‘Centre for Cryptocurrency Research and Engineering’.


## Implemented by a DAO
This architecture is being implemented by a DAO which is under development and who's founders I have worked closely with throughout my thesis. The DAO is financially backed by [Brevan Howard](https://www.brevanhoward.com/). However, my architecture is not limited to the aforementioned DAO and has been designed so that other DAOs can also straightforwardly implement it.
