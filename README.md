# About the Project
This repository contains the technical architecture for my MSc Computing thesis at Imperial College London: 'DAOs for Funding & Monitoring Infrastructure in Developing Countries'. I propose a novel financing pathway for building infrastructure in developing countries that is faster and offers greater accountability than existing approaches. My work recieved a distinction (75%) and is under publication.

I designed and developed an ecosystem of Ethereum smart contracts, in Solidity, that enables users to create on-chain fundraises for infrastructure projects using stablecoins. These smart contracts are in the [ProjectMarketplace](ProjectMarketplace) directory. I also developed a web application, written in JavaScript, that enables investors to monitor their projects using data that project proposers are required to supply. This web app can be found in the [App](App) directory. Please view the [final report](final_report.pdf) for more information.

## Background: Re-fungible token (RFT)
In the description of this system, I make reference to Re-fungible tokens or "RFTs". RFTs represent making the ownership of non-fungible tokens divisble. The concept is to have an ERC-721 NFT that is owned by a fungible token contract, such as an ERC-20. If the fungible token supply is limited, these fungible tokens represent the shared ownership of the NFT held by the fungible token contract and are referred to as RFTs. One RFT is equivalent to $\frac{1}{supply}$ proportional ownership of the corresponding NFT.

# Fundraising system

The smart contracts
There are 2 main smart contracts:

1. ProjectMarketplace: ERC-721 compliant smart contract for project proposers to interact with
2. Fundraising: ERC-20 compliant smart contract that represents a project's fundraise and is interacted with by investors

## How to use Fundraising System
You can either interact with a mock system that is deployed in the Ethereum Goerli testnet or deploy your own.

### Goerli Deployed System
I have deployed a ProjectMarketplace smart contract and created 3 mock project fundraises on the Ethereum Goerli testnet. These can be viewed on [OpenSea](https://testnets.opensea.io/collection/the-springdao-projectmarketplace-v2). Funds are raised in a mock coin that I have named 'testUSDT'. The system, thus far, has the following addresses:

- ProjectMarketplace: "0xd7bb862c137906160045814766af449A10c1FDFB"
- 'Water System: Endanachan, Tanzania' Project Fundraise: "0x832d15990cE4C5EA34424A1CA22b325daA635Dbb"
- 'Water System: Ndemban, The Gambia' Project Fundraise: "0xB46564A057AA2B9Efe7785EdeeA57d2677c18857"
- 'Water System: Adwumakase Kese, Ghana' Project Fundraise: "0x832d15990cE4C5EA34424A1CA22b325daA635Dbb"
- testUDT: "0xdcE77e597F228D7352eFD4aaF4185118BaE210cE"

### Creating Projects
You can create a project by calling the 'createProject' function in the ProjectMarketplace smart contract. The function takes as parameters:

- Target raise amount (uint256)
- Project name (string)
- Project Symbol (string)
- Project NFT URI (string)
- Project data access threshold (uint256)
- Address of ERC-20 based coin that funds are raised in (address)

When you create a project, a Fundraise smart contract will automatically be deployed. 

### Investing in Projects
To invest in a project's Fundraising smart contract you must first go to the smart contract of the ERC-20 that funds are being raised in and approve the Fundraising contract's address. You can then interact with the Fundraising contract's investment functions.

# Web Application

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
  ```
  cd <Backend directory>
  npm run start
  ```
3. Open another terminal window
4. Run in localhost
  ```
  cd < Frontend directory >
  npm run start
  ```

You will now be able to interact with the app at http://localhost:3000/


# Outcomes

## Publication

My thesis is under publication in the ACM acadmeic journal: ['Distributed Ledger Technology: Research and Practice'](https://dl.acm.org/journal/dlt), with the co-authors: [Dr Catherine Mulligan](https://www.imperial.ac.uk/people/c.mulligan), the ‘European Research Area Chair in Blockchain’, and [Professor William Knottenbelt](https://www.imperial.ac.uk/people/w.knottenbelt), Director of the ‘Centre for Cryptocurrency Research and Engineering’.


## Implemented by a DAO

This architecture is being implemented by a DAO which is under development and who's founders I have worked closely with throughout my thesis. The DAO is financially backed by [Brevan Howard](https://www.brevanhoward.com/) & Imperial College London. However, my architecture is not limited to the aforementioned DAO and has been designed so that other DAOs can also straightforwardly implement it.
