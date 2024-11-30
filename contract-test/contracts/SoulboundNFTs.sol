// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SoulboundNFTs is ERC721URIStorage, Ownable {
    using Strings for uint256;

    // NFT type enums
    enum NFTType { HUMANITY, CLUSTER, SYBIL }

    // Structs for storing NFT data
    struct NFTData {
        uint256 score;
        NFTType nftType;
        address contractAddress; // Only used for SYBIL type
    }

    // Mappings
    mapping(uint256 => NFTData) private _tokenData;
    mapping(address => bool) private _hasMintedHumanity;
    mapping(address => bool) private _hasMintedCluster;
    mapping(address => mapping(address => bool)) private _hasMintedSybil;
    
    // Token ID counter
    uint256 private _tokenIdCounter;

    // Events
    event NFTMinted(
        address indexed to, 
        uint256 indexed tokenId, 
        NFTType nftType, 
        uint256 score,
        address contractAddress
    );

    constructor() ERC721("SoulboundNFTs", "SOUL") Ownable(msg.sender) {}

    // Modifiers
    modifier canMintHumanity() {
        require(!_hasMintedHumanity[msg.sender], "Already minted Humanity NFT");
        _;
    }

    modifier canMintCluster() {
        require(!_hasMintedCluster[msg.sender], "Already minted Cluster NFT");
        _;
    }

    modifier canMintSybil(address contractAddress) {
        require(!_hasMintedSybil[msg.sender][contractAddress], "Already minted Sybil NFT for this contract");
        _;
    }

    // Minting functions
    function mintHumanityNFT(uint256 score, string memory uri) 
        external 
        canMintHumanity 
    {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        
        _tokenData[tokenId] = NFTData({
            score: score,
            nftType: NFTType.HUMANITY,
            contractAddress: address(0)
        });

        _hasMintedHumanity[msg.sender] = true;
        
        emit NFTMinted(msg.sender, tokenId, NFTType.HUMANITY, score, address(0));
    }

    function mintClusterNFT(uint256 score, string memory uri) 
        external 
        canMintCluster 
    {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        
        _tokenData[tokenId] = NFTData({
            score: score,
            nftType: NFTType.CLUSTER,
            contractAddress: address(0)
        });

        _hasMintedCluster[msg.sender] = true;
        
        emit NFTMinted(msg.sender, tokenId, NFTType.CLUSTER, score, address(0));
    }

    function mintSybilNFT(
        uint256 score, 
        string memory uri, 
        address contractAddress
    ) 
        external 
        canMintSybil(contractAddress) 
    {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        
        _tokenData[tokenId] = NFTData({
            score: score,
            nftType: NFTType.SYBIL,
            contractAddress: contractAddress
        });

        _hasMintedSybil[msg.sender][contractAddress] = true;
        
        emit NFTMinted(msg.sender, tokenId, NFTType.SYBIL, score, contractAddress);
    }

    // View functions
    function getTokenScore(uint256 tokenId) public view returns (uint256) {
        _requireOwned(tokenId);
        return _tokenData[tokenId].score;
    }

    function getTokenType(uint256 tokenId) public view returns (NFTType) {
        _requireOwned(tokenId);
        return _tokenData[tokenId].nftType;
    }

    function getTokenContract(uint256 tokenId) public view returns (address) {
        _requireOwned(tokenId);
        require(_tokenData[tokenId].nftType == NFTType.SYBIL, "Not a Sybil NFT");
        return _tokenData[tokenId].contractAddress;
    }

    // Make tokens soulbound
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0), "Err: token transfer is BLOCKED");   
        return super._update(to, tokenId, auth);
    }
}