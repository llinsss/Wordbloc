// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SpellBlocCertificates
 * @dev ERC1155 contract for educational certificates
 * @notice This contract issues verifiable learning certificates
 */
contract SpellBlocCertificates is ERC1155, Ownable, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _certificateIdCounter;
    
    // Certificate metadata
    struct Certificate {
        string title;
        string description;
        string level;
        string[] skillsDemonstrated;
        uint256 wordsRequired;
        uint256 accuracyRequired; // percentage * 100 (e.g., 8500 = 85%)
        uint256 issuedCount;
        bool isActive;
        bytes32 templateHash; // IPFS hash of certificate template
    }
    
    // Certificate verification data
    struct CertificateInstance {
        address childWallet;
        uint256 certificateTypeId;
        uint256 wordsCompleted;
        uint256 accuracyAchieved;
        uint256 issuedAt;
        bytes32 dataHash; // Hash of learning data
        string ipfsHash; // IPFS hash of certificate PDF
        bool isVerified;
    }
    
    mapping(uint256 => Certificate) public certificateTypes;
    mapping(uint256 => CertificateInstance) public certificateInstances;
    mapping(address => uint256[]) public childCertificates;
    mapping(bytes32 => bool) public usedDataHashes;
    mapping(address => bool) public authorizedIssuers;
    
    // Events
    event CertificateIssued(
        address indexed child,
        uint256 indexed instanceId,
        uint256 indexed certificateTypeId,
        string title,
        bytes32 dataHash
    );
    
    event CertificateVerified(
        uint256 indexed instanceId,
        address indexed verifier,
        uint256 timestamp
    );
    
    event CertificateTypeCreated(
        uint256 indexed certificateTypeId,
        string title,
        string level,
        uint256 wordsRequired
    );
    
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Not authorized to issue certificates");
        _;
    }
    
    constructor() ERC1155("https://api.spellbloc.com/certificates/{id}.json") {}
    
    /**
     * @dev Add authorized certificate issuer
     */
    function addAuthorizedIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
    }
    
    /**
     * @dev Remove authorized certificate issuer
     */
    function removeAuthorizedIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
    }
    
    /**
     * @dev Create a new certificate type
     */
    function createCertificateType(
        uint256 certificateTypeId,
        string memory title,
        string memory description,
        string memory level,
        string[] memory skillsDemonstrated,
        uint256 wordsRequired,
        uint256 accuracyRequired,
        bytes32 templateHash
    ) external onlyOwner {
        certificateTypes[certificateTypeId] = Certificate({
            title: title,
            description: description,
            level: level,
            skillsDemonstrated: skillsDemonstrated,
            wordsRequired: wordsRequired,
            accuracyRequired: accuracyRequired,
            issuedCount: 0,
            isActive: true,
            templateHash: templateHash
        });
        
        emit CertificateTypeCreated(certificateTypeId, title, level, wordsRequired);
    }
    
    /**
     * @dev Issue certificate to child
     */
    function issueCertificate(
        address childWallet,
        uint256 certificateTypeId,
        uint256 wordsCompleted,
        uint256 accuracyAchieved,
        bytes32 dataHash,
        string memory ipfsHash
    ) external onlyAuthorizedIssuer nonReentrant whenNotPaused {
        require(certificateTypes[certificateTypeId].isActive, "Certificate type not active");
        require(!usedDataHashes[dataHash], "Data hash already used");
        require(wordsCompleted >= certificateTypes[certificateTypeId].wordsRequired, "Insufficient words completed");
        require(accuracyAchieved >= certificateTypes[certificateTypeId].accuracyRequired, "Insufficient accuracy");
        
        uint256 instanceId = _certificateIdCounter.current();
        _certificateIdCounter.increment();
        
        // Create certificate instance
        certificateInstances[instanceId] = CertificateInstance({
            childWallet: childWallet,
            certificateTypeId: certificateTypeId,
            wordsCompleted: wordsCompleted,
            accuracyAchieved: accuracyAchieved,
            issuedAt: block.timestamp,
            dataHash: dataHash,
            ipfsHash: ipfsHash,
            isVerified: true
        });
        
        // Mint certificate token
        _mint(childWallet, instanceId, 1, "");
        
        // Update mappings
        childCertificates[childWallet].push(instanceId);
        usedDataHashes[dataHash] = true;
        certificateTypes[certificateTypeId].issuedCount++;
        
        emit CertificateIssued(
            childWallet,
            instanceId,
            certificateTypeId,
            certificateTypes[certificateTypeId].title,
            dataHash
        );
    }
    
    /**
     * @dev Verify certificate authenticity
     */
    function verifyCertificate(
        uint256 instanceId,
        bytes32 expectedDataHash
    ) external view returns (bool isValid, CertificateInstance memory certificate) {
        certificate = certificateInstances[instanceId];
        isValid = certificate.isVerified && 
                 certificate.dataHash == expectedDataHash &&
                 balanceOf(certificate.childWallet, instanceId) > 0;
    }
    
    /**
     * @dev Get all certificates for a child
     */
    function getChildCertificates(address childWallet) external view returns (uint256[] memory) {
        return childCertificates[childWallet];
    }
    
    /**
     * @dev Get certificate type details
     */
    function getCertificateType(uint256 certificateTypeId) external view returns (Certificate memory) {
        return certificateTypes[certificateTypeId];
    }
    
    /**
     * @dev Get certificate instance details
     */
    function getCertificateInstance(uint256 instanceId) external view returns (CertificateInstance memory) {
        return certificateInstances[instanceId];
    }
    
    /**
     * @dev Batch verify multiple certificates
     */
    function batchVerifyCertificates(
        uint256[] memory instanceIds,
        bytes32[] memory expectedHashes
    ) external view returns (bool[] memory results) {
        require(instanceIds.length == expectedHashes.length, "Array length mismatch");
        
        results = new bool[](instanceIds.length);
        for (uint256 i = 0; i < instanceIds.length; i++) {
            (bool isValid,) = this.verifyCertificate(instanceIds[i], expectedHashes[i]);
            results[i] = isValid;
        }
    }
    
    /**
     * @dev Get total certificates issued
     */
    function totalCertificatesIssued() external view returns (uint256) {
        return _certificateIdCounter.current();
    }
    
    /**
     * @dev Revoke certificate (emergency only)
     */
    function revokeCertificate(uint256 instanceId, string memory reason) external onlyOwner {
        CertificateInstance storage cert = certificateInstances[instanceId];
        require(cert.childWallet != address(0), "Certificate does not exist");
        
        cert.isVerified = false;
        
        // Burn the token
        _burn(cert.childWallet, instanceId, 1);
        
        emit CertificateVerified(instanceId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Update certificate URI
     */
    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
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
     * @dev Disable certificate type
     */
    function disableCertificateType(uint256 certificateTypeId) external onlyOwner {
        certificateTypes[certificateTypeId].isActive = false;
    }
    
    /**
     * @dev Override to prevent transfers (soulbound)
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override whenNotPaused {
        require(from == address(0) || to == address(0), "Certificates are non-transferable");
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}