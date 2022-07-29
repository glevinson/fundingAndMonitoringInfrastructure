// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract FundRaisingMarketPlace is ERC721Enumerable { // Collection of all springDAO NFTs

    string public baseURI;
    mapping (address => bool) public allowMint;

    constructor(string memory springDaoMetadataURI) ERC721("Spring Dao Project Marketplace", "SpringDAO") {
        baseURI = springDaoMetadataURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    modifier onlyProject() { // Only deployed project contracts can mint a asset NFT
        require(allowMint[msg.sender] == true, "Not allowed to call this function");
        _;
    }

    // Each minted NFT is an asset
    function mint(address to, uint256 tokenID) onlyProject public returns (bool) {
        _mint(to, tokenID);
        return true;
    }

    /*
    newProject:
                - Creates a new project and allows it to call mint
    */
    function newProject( string calldata projectName ) public returns (address) {
        Project project = new Project( projectName, msg.sender );
        address projectAddress = address(project);
        allowMint[projectAddress] = true;
        return projectAddress;
    }

}

contract Project{

    string public projectName;
    address public admin;
    FundRaisingMarketPlace public marketplace;

    constructor( string memory _projectName, address _admin ) {
        projectName = _projectName;
        admin = _admin;
        marketplace = FundRaisingMarketPlace(msg.sender);
    }

    // MintAsset NFT from SpingDAO Collection
    function mintAsset(address assetContract, uint256 tokenID) private {
        marketplace.mint(assetContract, tokenID);
    }

    // Add a new asset to the project
    function addAsset(uint256 targetAmount, string calldata assetName, string calldata assetSymbol) external {
        require(msg.sender == admin, 'Only Project Admin Can Add Assets');

        address newAssetAddress = address(new AssetFundRaise(targetAmount, assetName, assetSymbol)); // Need to concatenate project name to asset name and symbol, ...
        mintAsset(newAssetAddress, uint256(uint160(newAssetAddress))); // new AssetFundRaise Contract is owner of the NFT
    }

    // function findAssetContract( uint256 tokenID ) public pure returns ( address ){
    //     return address(uint160(tokenID));
    // }

}

// Same except now called AssetFundRaise: **************************************************************************


contract AssetFundRaise is ERC20 {
    IERC20 public constant DAI = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);
    IERC721 public immutable NFT; // The NFT that creates the FundRaisingCampaigns
    uint256 public targetAmount; // Target amount for the fundraising

    constructor(uint256 amount, string memory name, string memory symbol) ERC20(name, symbol) {
        targetAmount = amount;
        NFT = IERC721(msg.sender);
    }

    function invest(uint256 value) external {
        require(value <= targetAmount - totalSupply(), "Not enough shares left!");
        DAI.transferFrom(msg.sender, address(this), value);
        _mint(msg.sender, value);
        if (targetAmount == totalSupply()) { 
            DAI.transfer(NFT.ownerOf(uint256(uint160(address(this)))), targetAmount); 
        }
    }

    function withdrawInvestment(uint256 value) external {
        require(value <= balanceOf(msg.sender), "Not enough shares balance!");
        DAI.transfer(msg.sender, value);
        _burn(msg.sender, value);
    }
}