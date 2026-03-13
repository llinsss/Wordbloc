// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SpellBlocLeaderboard
 * @dev Smart contract for transparent, verifiable leaderboards
 * @notice This contract maintains global and classroom leaderboards on-chain
 */
contract SpellBlocLeaderboard is Ownable, Pausable, ReentrancyGuard {
    
    // Leaderboard entry
    struct LeaderboardEntry {
        address childWallet;
        uint256 score;
        uint256 wordsCompleted;
        uint256 accuracyPercentage; // percentage * 100
        uint256 totalPlaytime; // in minutes
        uint256 lastUpdated;
        bool isActive;
    }
    
    // Leaderboard metadata
    struct LeaderboardInfo {
        string name;
        string description;
        string leaderboardType; // global, classroom, age_group
        string period; // daily, weekly, monthly, all_time
        uint256 startTime;
        uint256 endTime;
        uint256 maxEntries;
        bool isActive;
        address[] participants;
    }
    
    // Mappings
    mapping(bytes32 => LeaderboardInfo) public leaderboards;
    mapping(bytes32 => mapping(address => LeaderboardEntry)) public leaderboardEntries;
    mapping(bytes32 => address[]) public leaderboardRankings; // sorted by score
    mapping(address => bool) public authorizedUpdaters;
    mapping(bytes32 => bool) public leaderboardExists;
    
    // Events
    event LeaderboardCreated(
        bytes32 indexed leaderboardId,
        string name,
        string leaderboardType,
        string period
    );
    
    event ScoreUpdated(
        bytes32 indexed leaderboardId,
        address indexed childWallet,
        uint256 newScore,
        uint256 newRank
    );
    
    event LeaderboardFinalized(
        bytes32 indexed leaderboardId,
        address[] topParticipants,
        uint256[] topScores
    );
    
    modifier onlyAuthorizedUpdater() {
        require(authorizedUpdaters[msg.sender], "Not authorized to update scores");
        _;
    }
    
    constructor() {}
    
    /**
     * @dev Add authorized score updater
     */
    function addAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
    }
    
    /**
     * @dev Remove authorized score updater
     */
    function removeAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
    }
    
    /**
     * @dev Create a new leaderboard
     */
    function createLeaderboard(
        bytes32 leaderboardId,
        string memory name,
        string memory description,
        string memory leaderboardType,
        string memory period,
        uint256 startTime,
        uint256 endTime,
        uint256 maxEntries
    ) external onlyOwner {
        require(!leaderboardExists[leaderboardId], "Leaderboard already exists");
        require(startTime < endTime, "Invalid time range");
        require(maxEntries > 0, "Max entries must be greater than 0");
        
        leaderboards[leaderboardId] = LeaderboardInfo({
            name: name,
            description: description,
            leaderboardType: leaderboardType,
            period: period,
            startTime: startTime,
            endTime: endTime,
            maxEntries: maxEntries,
            isActive: true,
            participants: new address[](0)
        });
        
        leaderboardExists[leaderboardId] = true;
        
        emit LeaderboardCreated(leaderboardId, name, leaderboardType, period);
    }
    
    /**
     * @dev Update or add score for a child
     */
    function updateScore(
        bytes32 leaderboardId,
        address childWallet,
        uint256 score,
        uint256 wordsCompleted,
        uint256 accuracyPercentage,
        uint256 totalPlaytime
    ) external onlyAuthorizedUpdater nonReentrant whenNotPaused {
        require(leaderboardExists[leaderboardId], "Leaderboard does not exist");
        require(leaderboards[leaderboardId].isActive, "Leaderboard is not active");
        require(block.timestamp >= leaderboards[leaderboardId].startTime, "Leaderboard not started");
        require(block.timestamp <= leaderboards[leaderboardId].endTime, "Leaderboard ended");
        require(childWallet != address(0), "Invalid child wallet");
        
        LeaderboardEntry storage entry = leaderboardEntries[leaderboardId][childWallet];
        
        // If new participant, add to participants array
        if (!entry.isActive) {
            require(leaderboards[leaderboardId].participants.length < leaderboards[leaderboardId].maxEntries, 
                    "Leaderboard is full");
            leaderboards[leaderboardId].participants.push(childWallet);
        }
        
        // Update entry
        entry.childWallet = childWallet;
        entry.score = score;
        entry.wordsCompleted = wordsCompleted;
        entry.accuracyPercentage = accuracyPercentage;
        entry.totalPlaytime = totalPlaytime;
        entry.lastUpdated = block.timestamp;
        entry.isActive = true;
        
        // Update rankings
        _updateRankings(leaderboardId);
        
        // Get new rank
        uint256 newRank = _getRank(leaderboardId, childWallet);
        
        emit ScoreUpdated(leaderboardId, childWallet, score, newRank);
    }
    
    /**
     * @dev Get leaderboard rankings
     */
    function getLeaderboard(bytes32 leaderboardId, uint256 limit) 
        external view returns (address[] memory wallets, uint256[] memory scores, uint256[] memory ranks) {
        require(leaderboardExists[leaderboardId], "Leaderboard does not exist");
        
        address[] memory rankings = leaderboardRankings[leaderboardId];
        uint256 length = rankings.length > limit ? limit : rankings.length;
        
        wallets = new address[](length);
        scores = new uint256[](length);
        ranks = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            wallets[i] = rankings[i];
            scores[i] = leaderboardEntries[leaderboardId][rankings[i]].score;
            ranks[i] = i + 1;
        }
    }
    
    /**
     * @dev Get specific child's leaderboard entry
     */
    function getChildEntry(bytes32 leaderboardId, address childWallet) 
        external view returns (LeaderboardEntry memory entry, uint256 rank) {
        require(leaderboardExists[leaderboardId], "Leaderboard does not exist");
        
        entry = leaderboardEntries[leaderboardId][childWallet];
        rank = _getRank(leaderboardId, childWallet);
    }
    
    /**
     * @dev Get leaderboard info
     */
    function getLeaderboardInfo(bytes32 leaderboardId) external view returns (LeaderboardInfo memory) {
        require(leaderboardExists[leaderboardId], "Leaderboard does not exist");
        return leaderboards[leaderboardId];
    }
    
    /**
     * @dev Finalize leaderboard (end period)
     */
    function finalizeLeaderboard(bytes32 leaderboardId) external onlyOwner {
        require(leaderboardExists[leaderboardId], "Leaderboard does not exist");
        require(leaderboards[leaderboardId].isActive, "Leaderboard already finalized");
        require(block.timestamp > leaderboards[leaderboardId].endTime, "Leaderboard period not ended");
        
        leaderboards[leaderboardId].isActive = false;
        
        // Get top 10 for event
        address[] memory rankings = leaderboardRankings[leaderboardId];
        uint256 topCount = rankings.length > 10 ? 10 : rankings.length;
        
        address[] memory topParticipants = new address[](topCount);
        uint256[] memory topScores = new uint256[](topCount);
        
        for (uint256 i = 0; i < topCount; i++) {
            topParticipants[i] = rankings[i];
            topScores[i] = leaderboardEntries[leaderboardId][rankings[i]].score;
        }
        
        emit LeaderboardFinalized(leaderboardId, topParticipants, topScores);
    }
    
    /**
     * @dev Get total participants in leaderboard
     */
    function getParticipantCount(bytes32 leaderboardId) external view returns (uint256) {
        require(leaderboardExists[leaderboardId], "Leaderboard does not exist");
        return leaderboards[leaderboardId].participants.length;
    }
    
    /**
     * @dev Check if child is in leaderboard
     */
    function isParticipant(bytes32 leaderboardId, address childWallet) external view returns (bool) {
        require(leaderboardExists[leaderboardId], "Leaderboard does not exist");
        return leaderboardEntries[leaderboardId][childWallet].isActive;
    }
    
    /**
     * @dev Pause contract
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
     * @dev Internal function to update rankings
     */
    function _updateRankings(bytes32 leaderboardId) internal {
        address[] storage rankings = leaderboardRankings[leaderboardId];
        address[] memory participants = leaderboards[leaderboardId].participants;
        
        // Clear current rankings
        delete leaderboardRankings[leaderboardId];
        
        // Rebuild rankings array with active participants
        for (uint256 i = 0; i < participants.length; i++) {
            if (leaderboardEntries[leaderboardId][participants[i]].isActive) {
                rankings.push(participants[i]);
            }
        }
        
        // Sort by score (bubble sort for simplicity, can be optimized)
        for (uint256 i = 0; i < rankings.length; i++) {
            for (uint256 j = i + 1; j < rankings.length; j++) {
                if (leaderboardEntries[leaderboardId][rankings[i]].score < 
                    leaderboardEntries[leaderboardId][rankings[j]].score) {
                    address temp = rankings[i];
                    rankings[i] = rankings[j];
                    rankings[j] = temp;
                }
            }
        }
    }
    
    /**
     * @dev Internal function to get child's rank
     */
    function _getRank(bytes32 leaderboardId, address childWallet) internal view returns (uint256) {
        address[] memory rankings = leaderboardRankings[leaderboardId];
        
        for (uint256 i = 0; i < rankings.length; i++) {
            if (rankings[i] == childWallet) {
                return i + 1;
            }
        }
        
        return 0; // Not found
    }
    
    /**
     * @dev Remove participant (admin only)
     */
    function removeParticipant(bytes32 leaderboardId, address childWallet) external onlyOwner {
        require(leaderboardExists[leaderboardId], "Leaderboard does not exist");
        require(leaderboardEntries[leaderboardId][childWallet].isActive, "Participant not active");
        
        leaderboardEntries[leaderboardId][childWallet].isActive = false;
        _updateRankings(leaderboardId);
    }
}