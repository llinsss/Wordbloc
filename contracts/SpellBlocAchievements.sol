// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SpellBlocAchievements
 * @dev NFT contract for educational achievement badges
 * @notice This contract mints achievement NFTs for children's learning milestones
 */
contract SpellBlocAchievements is ERC721, ERC721URIStorage, Ownable, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    
    // Achievement metadata
    struct Achievement {
        string name;
        string description;
        string category;
        uint256 requirementValue;
        string rarity; // common, rare, epic, legendary
        uint256 mintedCount;
        bool isActive;
    }
    
    // Child wallet to achievement mapping
    mapping(address => uint256[]) public childAchievements;
    mapping(uint256 => Achievement) public achievements;
    mapping(uint256 => address) public achievementToChild;
    mapping(address => mapping(string => bool)) public hasAchievement;
    
    // Events
    event AchievementMinted(
        address indexed child,
        uint256 indexed tokenId,
        string achievementName,
        string rarity
    );
    
    event AchievementTypeCreated(
        uint256 indexed achievementId,
        string name,
        string category,
        string rarity
    );
    
    // Modifiers
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        _;
    }
    
    mapping(address => bool) public authorizedMinters;
    
    constructor() ERC721("SpellBloc Achievement Badges", "SBAB") {}
    
    /**
     * @dev Add authorized minter (backend service)
     */
    function addAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
    }
    
    /**
     * @dev Remove authorized minter
     */
    function removeAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
    }
    
    /**
     * @dev Create a new achievement type
     */
    function createAchievementType(
        uint256 achievementId,
        string memory name,
        string memory description,
        string memory category,
        uint256 requirementValue,
        string memory rarity
    ) external onlyOwner {
        achievements[achievementId] = Achievement({
            name: name,
            description: description,
            category: category,
            requirementValue: requirementValue,
            rarity: rarity,
            mintedCount: 0,
            isActive: true
        });
        
        emit AchievementTypeCreated(achievementId, name, category, rarity);
    }
    
    /**
     * @dev Mint achievement NFT to child's wallet
     */
    function mintAchievement(
        address childWallet,
        uint256 achievementId,
        string memory tokenURI
    ) external onlyAuthorizedMinter nonReentrant whenNotPaused {
        require(achievements[achievementId].isActive, "Achievement type not active");
        require(!hasAchievement[childWallet][achievements[achievementId].name], "Achievement already earned");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(childWallet, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Update mappings
        childAchievements[childWallet].push(tokenId);
        achievementToChild[tokenId] = childWallet;
        hasAchievement[childWallet][achievements[achievementId].name] = true;
        achievements[achievementId].mintedCount++;
        
        emit AchievementMinted(
            childWallet,
            tokenId,
            achievements[achievementId].name,
            achievements[achievementId].rarity
        );
    }
    
    /**
     * @dev Get all achievements for a child
     */
    function getChildAchievements(address childWallet) external view returns (uint256[] memory) {
        return childAchievements[childWallet];
    }
    
    /**
     * @dev Get achievement details
     */
    function getAchievement(uint256 achievementId) external view returns (Achievement memory) {
        return achievements[achievementId];
    }
    
    /**
     * @dev Check if child has specific achievement
     */
    function childHasAchievement(address childWallet, string memory achievementName) external view returns (bool) {
        return hasAchievement[childWallet][achievementName];
    }
    
    /**
     * @dev Get total supply of tokens
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Pause contract (emergency)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Disable achievement type
     */
    function disableAchievementType(uint256 achievementId) external onlyOwner {
        achievements[achievementId].isActive = false;
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Prevent transfers (soulbound tokens)
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override whenNotPaused {
        require(from == address(0) || to == address(0), "Achievement badges are non-transferable");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}