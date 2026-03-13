// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./SpellBlocAchievements.sol";
import "./SpellBlocCertificates.sol";
import "./SpellBlocLeaderboard.sol";

/**
 * @title SpellBlocRegistry
 * @dev Main registry contract that manages all SpellBloc platform contracts
 * @notice This contract serves as the central hub for the SpellBloc education platform
 */
contract SpellBlocRegistry is Ownable, Pausable {
    
    // Contract addresses
    address public achievementsContract;
    address public certificatesContract;
    address public leaderboardContract;
    
    // Platform statistics
    struct PlatformStats {
        uint256 totalUsers;
        uint256 totalAchievements;
        uint256 totalCertificates;
        uint256 totalWordsLearned;
        uint256 totalPlaytimeMinutes;
        uint256 lastUpdated;
    }
    
    PlatformStats public platformStats;
    
    // User registration
    mapping(address => bool) public registeredUsers;
    mapping(address => uint256) public userRegistrationTime;
    mapping(address => string) public userProfiles; // IPFS hash of profile data
    
    // Grant and research data
    mapping(string => bytes32) public researchDataHashes;
    mapping(bytes32 => bool) public verifiedResearchData;
    
    // Events
    event ContractUpdated(string contractType, address oldAddress, address newAddress);
    event UserRegistered(address indexed userWallet, uint256 timestamp);
    event PlatformStatsUpdated(uint256 totalUsers, uint256 totalAchievements, uint256 totalCertificates);
    event ResearchDataSubmitted(string dataType, bytes32 dataHash, uint256 timestamp);
    
    // Modifiers
    modifier onlyRegisteredUser() {
        require(registeredUsers[msg.sender], "User not registered");
        _;
    }
    
    constructor() {}
    
    /**
     * @dev Initialize platform contracts
     */
    function initializePlatform(
        address _achievementsContract,
        address _certificatesContract,
        address _leaderboardContract
    ) external onlyOwner {
        require(_achievementsContract != address(0), "Invalid achievements contract");
        require(_certificatesContract != address(0), "Invalid certificates contract");
        require(_leaderboardContract != address(0), "Invalid leaderboard contract");
        
        achievementsContract = _achievementsContract;
        certificatesContract = _certificatesContract;
        leaderboardContract = _leaderboardContract;
        
        emit ContractUpdated("achievements", address(0), _achievementsContract);
        emit ContractUpdated("certificates", address(0), _certificatesContract);
        emit ContractUpdated("leaderboard", address(0), _leaderboardContract);
    }
    
    /**
     * @dev Update achievements contract
     */
    function updateAchievementsContract(address newContract) external onlyOwner {
        require(newContract != address(0), "Invalid contract address");
        address oldContract = achievementsContract;
        achievementsContract = newContract;
        emit ContractUpdated("achievements", oldContract, newContract);
    }
    
    /**
     * @dev Update certificates contract
     */
    function updateCertificatesContract(address newContract) external onlyOwner {
        require(newContract != address(0), "Invalid contract address");
        address oldContract = certificatesContract;
        certificatesContract = newContract;
        emit ContractUpdated("certificates", oldContract, newContract);
    }
    
    /**
     * @dev Update leaderboard contract
     */
    function updateLeaderboardContract(address newContract) external onlyOwner {
        require(newContract != address(0), "Invalid contract address");
        address oldContract = leaderboardContract;
        leaderboardContract = newContract;
        emit ContractUpdated("leaderboard", oldContract, newContract);
    }
    
    /**
     * @dev Register user wallet (called by backend)
     */
    function registerUser(address userWallet, string memory profileHash) external onlyOwner {
        require(userWallet != address(0), "Invalid wallet address");
        require(!registeredUsers[userWallet], "User already registered");
        
        registeredUsers[userWallet] = true;
        userRegistrationTime[userWallet] = block.timestamp;
        userProfiles[userWallet] = profileHash;
        
        platformStats.totalUsers++;
        platformStats.lastUpdated = block.timestamp;
        
        emit UserRegistered(userWallet, block.timestamp);
    }
    
    /**
     * @dev Update platform statistics
     */
    function updatePlatformStats(
        uint256 totalAchievements,
        uint256 totalCertificates,
        uint256 totalWordsLearned,
        uint256 totalPlaytimeMinutes
    ) external onlyOwner {
        platformStats.totalAchievements = totalAchievements;
        platformStats.totalCertificates = totalCertificates;
        platformStats.totalWordsLearned = totalWordsLearned;
        platformStats.totalPlaytimeMinutes = totalPlaytimeMinutes;
        platformStats.lastUpdated = block.timestamp;
        
        emit PlatformStatsUpdated(platformStats.totalUsers, totalAchievements, totalCertificates);
    }
    
    /**
     * @dev Submit research data hash for grant compliance
     */
    function submitResearchData(
        string memory dataType,
        bytes32 dataHash
    ) external onlyOwner {
        require(dataHash != bytes32(0), "Invalid data hash");
        
        researchDataHashes[dataType] = dataHash;
        verifiedResearchData[dataHash] = true;
        
        emit ResearchDataSubmitted(dataType, dataHash, block.timestamp);
    }
    
    /**
     * @dev Verify research data authenticity
     */
    function verifyResearchData(bytes32 dataHash) external view returns (bool) {
        return verifiedResearchData[dataHash];
    }
    
    /**
     * @dev Get platform statistics
     */
    function getPlatformStats() external view returns (PlatformStats memory) {
        return platformStats;
    }
    
    /**
     * @dev Get all contract addresses
     */
    function getContractAddresses() external view returns (
        address achievements,
        address certificates,
        address leaderboard
    ) {
        return (achievementsContract, certificatesContract, leaderboardContract);
    }
    
    /**
     * @dev Check if user is registered
     */
    function isUserRegistered(address userWallet) external view returns (bool) {
        return registeredUsers[userWallet];
    }
    
    /**
     * @dev Get user profile
     */
    function getUserProfile(address userWallet) external view returns (string memory) {
        require(registeredUsers[userWallet], "User not registered");
        return userProfiles[userWallet];
    }
    
    /**
     * @dev Update user profile
     */
    function updateUserProfile(address userWallet, string memory newProfileHash) external onlyOwner {
        require(registeredUsers[userWallet], "User not registered");
        userProfiles[userWallet] = newProfileHash;
    }
    
    /**
     * @dev Get research data hash
     */
    function getResearchDataHash(string memory dataType) external view returns (bytes32) {
        return researchDataHashes[dataType];
    }
    
    /**
     * @dev Emergency pause all platform contracts
     */
    function emergencyPauseAll() external onlyOwner {
        if (achievementsContract != address(0)) {
            SpellBlocAchievements(achievementsContract).pause();
        }
        if (certificatesContract != address(0)) {
            SpellBlocCertificates(certificatesContract).pause();
        }
        if (leaderboardContract != address(0)) {
            SpellBlocLeaderboard(leaderboardContract).pause();
        }
        _pause();
    }
    
    /**
     * @dev Emergency unpause all platform contracts
     */
    function emergencyUnpauseAll() external onlyOwner {
        if (achievementsContract != address(0)) {
            SpellBlocAchievements(achievementsContract).unpause();
        }
        if (certificatesContract != address(0)) {
            SpellBlocCertificates(certificatesContract).unpause();
        }
        if (leaderboardContract != address(0)) {
            SpellBlocLeaderboard(leaderboardContract).unpause();
        }
        _unpause();
    }
    
    /**
     * @dev Get platform health status
     */
    function getPlatformHealth() external view returns (
        bool registryActive,
        bool achievementsActive,
        bool certificatesActive,
        bool leaderboardActive
    ) {
        registryActive = !paused();
        
        if (achievementsContract != address(0)) {
            try SpellBlocAchievements(achievementsContract).paused() returns (bool isPaused) {
                achievementsActive = !isPaused;
            } catch {
                achievementsActive = false;
            }
        }
        
        if (certificatesContract != address(0)) {
            try SpellBlocCertificates(certificatesContract).paused() returns (bool isPaused) {
                certificatesActive = !isPaused;
            } catch {
                certificatesActive = false;
            }
        }
        
        if (leaderboardContract != address(0)) {
            try SpellBlocLeaderboard(leaderboardContract).paused() returns (bool isPaused) {
                leaderboardActive = !isPaused;
            } catch {
                leaderboardActive = false;
            }
        }
    }
    
    /**
     * @dev Batch operation for efficiency
     */
    function batchRegisterUsers(
        address[] memory userWallets,
        string[] memory profileHashes
    ) external onlyOwner {
        require(userWallets.length == profileHashes.length, "Array length mismatch");
        
        for (uint256 i = 0; i < userWallets.length; i++) {
            if (!registeredUsers[userWallets[i]] && userWallets[i] != address(0)) {
                registeredUsers[userWallets[i]] = true;
                userRegistrationTime[userWallets[i]] = block.timestamp;
                userProfiles[userWallets[i]] = profileHashes[i];
                platformStats.totalUsers++;
                
                emit UserRegistered(userWallets[i], block.timestamp);
            }
        }
        
        platformStats.lastUpdated = block.timestamp;
    }
}