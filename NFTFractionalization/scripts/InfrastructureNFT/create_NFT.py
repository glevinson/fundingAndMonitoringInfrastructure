
# Referenced from: https://github.com/PatrickAlphaC/nft-mix/blob/main/scripts/simple_collectible/create_collectible.py
# Not sure how useable this is...
#************************************************************************************************************************
#!/usr/bin/python3
from brownie import InfrastructureNFT, accounts, network, config
from scripts.helpful_scripts import OPENSEA_FORMAT

sample_token_uri = "https://gateway.pinata.cloud/ipfs/QmWd1az29puZjEqSDHcVwceNVva1SNJ1KPsKPAwbGxsXjH/WaterDispenserMeta"


def main():
    dev = accounts.add(config["wallets"]["from_key"])
    print(network.show_active())
    infrastructureNFT = InfrastructureNFT[len(SimpleCollectible) - 1]
    token_id = infrastructureNFT.tokenCounter()
    transaction = infrastructureNFT.createCollectible(sample_token_uri, {"from": dev})
    transaction.wait(1)
    print(
        "Awesome! You can view your NFT at {}".format(
            OPENSEA_FORMAT.format(infrastructureNFT.address, token_id)
        )
    )
    print('Please give up to 20 minutes, and hit the "refresh metadata" button')