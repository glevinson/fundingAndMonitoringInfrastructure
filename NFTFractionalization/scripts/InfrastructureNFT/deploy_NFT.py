# Referenced from: https://github.com/PatrickAlphaC/nft-mix/blob/main/scripts/simple_collectible/deploy_simple.py
# Not sure how useable this is...
#************************************************************************************************************************
#!/usr/bin/python3
from brownie import InfrastructureNFT, accounts, network, config
from scripts.helpful_scripts import get_publish_source

def main():
    dev = accounts.add(config["wallets"]["from_key"])
    print(network.show_active())
    InfrastructureNFT.deploy({"from": dev}, publish_source=get_publish_source())