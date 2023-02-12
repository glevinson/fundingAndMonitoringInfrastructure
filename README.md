# About the Project
This repository contains the technical architecture for my MSc Computing thesis at Imperial College London: 'DAOs for Funding & Monitoring Infrastructure in Developing Countries'. I propose a novel financing pathway for building infrastructure in developing countries that is faster and offers greater accountability than existing approaches. My work recieved a distinction (75%) and is under publication.

I designed and developed an ecosystem of Ethereum smart contracts, in Solidity, that enables users to create on-chain fundraises for infrastructure projects using stablecoins. These smart contracts are in the [ProjectMarketplace directory](ProjectMarketplace). I also developed a web application, written in JavaScript, that enables investors to monitor their projects using data that project proposers are required to supply. This web app can be found in the [App directory](App). Please view the [final report](final_report.pdf) for more information.

## Background: Re-fungible token (RFT)
In the description of this system, I will refer to Re-fungible tokens or "RFTs" a lot. RFTs represent making the ownership of non-fungible tokens divisble. The concept is to have an ERC-721 NFT that is owned by a fungible token contract, such as an ERC-20. If the fungible token supply is limited, these fungible tokens represent the shared ownership of the NFT held by the fungible token contract and are referred to as RFTs. One RFT is equivalent to $\frac{1}{supply}$ proportional ownership of the corresponding NFT.

## Prototype that can interact with
I have deployed a mock system and created 4 mock on-chain project fundraises on the Ethereum Goerli testnet. These can be viewed on [OpenSea](https://testnets.opensea.io/collection/the-springdao-projectmarketplace-v2).

## Publication

My thesis is under publication in the ACM acadmeic journal: ['Distributed Ledger Technology: Research and Practice'](https://dl.acm.org/journal/dlt), with the co-authors: [Dr Catherine Mulligan](https://www.imperial.ac.uk/people/c.mulligan), the ‘European Research Area Chair in Blockchain’, and [Professor William Knottenbelt](https://www.imperial.ac.uk/people/w.knottenbelt), Director of the ‘Centre for Cryptocurrency Research and Engineering’.


## Implemented by a DAO

This architecture is being implemented by a DAO which is under development and who's founders I have worked closely with throughout my thesis. The DAO is financially backed by [Brevan Howard](https://www.brevanhoward.com/) & Imperial College London. However, my architecture is not limited to the aforementioned DAO and has been designed so that other DAOs can also straightforwardly implement it.
