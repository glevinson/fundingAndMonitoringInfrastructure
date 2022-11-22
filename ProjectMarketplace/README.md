This directory contains the smart contracts of my technical architecture. 

## ProjectMaretplace

We have designed and implemented an ERC-721 compliant smart contract in Solidity called ‘ProjectMarketplace’ for project proposers to interact with. The contract’s main function is called ‘createProject’. The entity that calls the func- tion specifies the details of the project in the function’s parameters, such as the name of the project, the amount it is aiming to raise, the cryptocurrency that funds are raised in and the ‘data access threshold’ (minimum amount ofinvestment required to view a project’s data). When ‘createProject’ is called, a smart contract that represents the project’s fundraise is deployed and a NFT minted which is owned by the fundraising contract. The NFT represents the project and its ownership. ‘createProject’ uses 2,440,000 units of gas which is estimated to cost approximately 0.0853 ETH according to the average daily gas prices from June - September 2022 .
