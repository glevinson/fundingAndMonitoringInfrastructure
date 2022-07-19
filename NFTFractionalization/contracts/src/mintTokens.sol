// SPDX-License-Identifier: MIT
import "./OpenZeppelin/Tokens/ERC-20/ERC20.sol";
import "./OpenZeppelin/Tokens/InfrastructureNFT.sol";

contract mintTokens{

    address public NFTaddress;

    constructor ( address _NFTaddress ){
        NFTaddress = _NFTaddress;
    }

    function mint ( string memory _tokenURI, string memory _name, string memory _symbol ) public returns ( address ) {
        
        InfrastructureNFT nft = InfrastructureNFT(NFTaddress);

        nft.createCollectible( msg.sender, _tokenURI);

        ERC20 erc20tokens = new ERC20( _name, _symbol );

        erc20tokens._mint( msg.sender, 0 );

        return msg.sender;

    }

}