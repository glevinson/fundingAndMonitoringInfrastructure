// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract FundRaising is ERC20 {
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

// ATTEMPTED TO CREATE STRUCTS OF PROJECTS, THERE DOEN'T SEEM TO NEED TO BE A PROJECT CONTRACT FOR THE SAKE OF IT, BUT IT DOES SEPARATE PROJECTS NICELY
// the problems is that in that case, each project cannot called the marketplace mint function. Also I'm not sure how it would affect the URI. 
// It would be nice as it would keep all the different projects in the same NFT colelction, and they would be distinguishable by traits such as village, country and 
// infrastructure type. Whatever happens, the contract that addsAssets needs to be able to mint the NFTs.
// 

contract FundRaisingMarketPlace is ERC721Enumerable {
    string public baseURI; 

    struct Project{
        string projectName;
        string projectSymbol;
        uint numberAssets;

        string[] assetNames; // Can surely be worked out
        string[] assetSymbols;
        address[] assetAddresses;
    }

    Project[] projects;
    uint256 numberProjects;

    constructor(string memory springDaoMetadataURI) ERC721("Spring Dao Project Marketplace", "SpringDAO") {
        baseURI = springDaoMetadataURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function newProject( string memory _projectName, string memory _projectSymbol ) external {
        Project memory project;
        project.projectName = _projectName;
        project.projectSymbol = _projectSymbol;
        numberProjects += 1;
    }

    function addAsset(string memory _projectName, uint256 targetAmount, string memory assetName, string memory assetSymbol) external {

        for ( uint256 i = 0; i < numberProjects; i++ ){
            // comparison due to being unable to compare strings of storage and memory: https://stackoverflow.com/questions/54499116/how-do-you-compare-strings-in-solidity
            if ( keccak256(abi.encodePacked(projects[i].projectName)) == keccak256(abi.encodePacked(_projectName)) ){
                projects[i].assetNames.push(assetName);
                projects[i].assetSymbols.push(assetSymbol);

                address newAssetAddress = address(new FundRaising(targetAmount, assetName, assetSymbol));

                _safeMint(msg.sender, uint256(uint160(newAssetAddress)));
                projects[i].assetAddresses.push(newAssetAddress);
                return;
            }
        }
        revert();
    }

    function findProjectContract( uint256 tokenID ) public pure returns ( address ){
        return address(uint160(tokenID));
    }
}