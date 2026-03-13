const { ethers } = require('ethers');
const { ContractKit, newKit } = require('@celo/contractkit');
const winston = require('winston');

// Contract ABIs (simplified for key functions)
const ACHIEVEMENTS_ABI = [
    "function mintAchievement(address childWallet, uint256 achievementId, string memory tokenURI) external",
    "function getChildAchievements(address childWallet) external view returns (uint256[] memory)",
    "function hasAchievement(address childWallet, string memory achievementName) external view returns (bool)",
    "event AchievementMinted(address indexed child, uint256 indexed tokenId, string achievementName, string rarity)"
];

const CERTIFICATES_ABI = [
    "function issueCertificate(address childWallet, uint256 certificateTypeId, uint256 wordsCompleted, uint256 accuracyAchieved, bytes32 dataHash, string memory ipfsHash) external",
    "function verifyCertificate(uint256 instanceId, bytes32 expectedDataHash) external view returns (bool isValid, tuple(address childWallet, uint256 certificateTypeId, uint256 wordsCompleted, uint256 accuracyAchieved, uint256 issuedAt, bytes32 dataHash, string ipfsHash, bool isVerified) certificate)",
    "function getChildCertificates(address childWallet) external view returns (uint256[] memory)",
    "event CertificateIssued(address indexed child, uint256 indexed instanceId, uint256 indexed certificateTypeId, string title, bytes32 dataHash)"
];

const LEADERBOARD_ABI = [
    "function updateScore(bytes32 leaderboardId, address childWallet, uint256 score, uint256 wordsCompleted, uint256 accuracyPercentage, uint256 totalPlaytime) external",
    "function getLeaderboard(bytes32 leaderboardId, uint256 limit) external view returns (address[] memory wallets, uint256[] memory scores, uint256[] memory ranks)",
    "function getChildEntry(bytes32 leaderboardId, address childWallet) external view returns (tuple(address childWallet, uint256 score, uint256 wordsCompleted, uint256 accuracyPercentage, uint256 totalPlaytime, uint256 lastUpdated, bool isActive) entry, uint256 rank)",
    "event ScoreUpdated(bytes32 indexed leaderboardId, address indexed childWallet, uint256 newScore, uint256 newRank)"
];

class BlockchainService {
    constructor() {
        this.provider = null;
        this.kit = null;
        this.wallet = null;
        this.contracts = {
            achievements: null,
            certificates: null,
            leaderboard: null,
            registry: null
        };
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            defaultMeta: { service: 'blockchain-service' },
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'logs/blockchain.log' })
            ]
        });
        this.isInitialized = false;
    }

    async initialize() {
        try {
            const network = process.env.CELO_NETWORK || 'alfajores';
            const rpcUrl = process.env.CELO_RPC_URL || 'https://alfajores-forno.celo-testnet.org';
            
            // Initialize Celo ContractKit
            this.kit = newKit(rpcUrl);
            this.provider = this.kit.connection.web3.currentProvider;
            
            // Set up wallet from private key
            if (process.env.CELO_PRIVATE_KEY) {
                const account = this.kit.connection.addAccount(process.env.CELO_PRIVATE_KEY);
                this.kit.connection.defaultAccount = account.address;
                this.wallet = account;
                this.logger.info(`Blockchain service initialized with wallet: ${account.address}`);
            } else if (process.env.CELO_MNEMONIC) {
                const wallet = ethers.Wallet.fromMnemonic(process.env.CELO_MNEMONIC);
                this.kit.connection.addAccount(wallet.privateKey);
                this.kit.connection.defaultAccount = wallet.address;
                this.wallet = wallet;
                this.logger.info(`Blockchain service initialized with mnemonic wallet: ${wallet.address}`);
            } else {
                throw new Error('No wallet configuration found. Set CELO_PRIVATE_KEY or CELO_MNEMONIC');
            }

            // Initialize contracts
            await this.initializeContracts();
            
            this.isInitialized = true;
            this.logger.info(`Blockchain service initialized on ${network} network`);
            
        } catch (error) {
            this.logger.error('Failed to initialize blockchain service:', error);
            throw error;
        }
    }

    async initializeContracts() {
        try {
            const web3 = this.kit.connection.web3;
            
            // Initialize contract instances
            if (process.env.ACHIEVEMENTS_CONTRACT_ADDRESS) {
                this.contracts.achievements = new web3.eth.Contract(
                    ACHIEVEMENTS_ABI,
                    process.env.ACHIEVEMENTS_CONTRACT_ADDRESS
                );
            }
            
            if (process.env.CERTIFICATES_CONTRACT_ADDRESS) {
                this.contracts.certificates = new web3.eth.Contract(
                    CERTIFICATES_ABI,
                    process.env.CERTIFICATES_CONTRACT_ADDRESS
                );
            }
            
            if (process.env.LEADERBOARD_CONTRACT_ADDRESS) {
                this.contracts.leaderboard = new web3.eth.Contract(
                    LEADERBOARD_ABI,
                    process.env.LEADERBOARD_CONTRACT_ADDRESS
                );
            }
            
            this.logger.info('Smart contracts initialized');
        } catch (error) {
            this.logger.error('Failed to initialize contracts:', error);
            throw error;
        }
    }

    async checkHealth() {
        try {
            if (!this.isInitialized) return false;
            
            // Check network connection
            const blockNumber = await this.kit.connection.web3.eth.getBlockNumber();
            
            // Check wallet balance
            const balance = await this.kit.connection.web3.eth.getBalance(this.wallet.address);
            
            this.logger.info(`Blockchain health check: Block ${blockNumber}, Balance: ${balance}`);
            return true;
        } catch (error) {
            this.logger.error('Blockchain health check failed:', error);
            return false;
        }
    }

    // Achievement NFT Functions
    async mintAchievementNFT(childWalletAddress, achievementId, metadataUri) {
        try {
            if (!this.contracts.achievements) {
                throw new Error('Achievements contract not initialized');
            }

            const tx = await this.contracts.achievements.methods
                .mintAchievement(childWalletAddress, achievementId, metadataUri)
                .send({
                    from: this.wallet.address,
                    gas: 500000,
                    gasPrice: await this.kit.connection.web3.eth.getGasPrice()
                });

            this.logger.info(`Achievement NFT minted: ${tx.transactionHash}`);
            return {
                success: true,
                transactionHash: tx.transactionHash,
                blockNumber: tx.blockNumber,
                gasUsed: tx.gasUsed
            };
        } catch (error) {
            this.logger.error('Failed to mint achievement NFT:', error);
            throw error;
        }
    }

    async getChildAchievements(childWalletAddress) {
        try {
            if (!this.contracts.achievements) {
                throw new Error('Achievements contract not initialized');
            }

            const achievements = await this.contracts.achievements.methods
                .getChildAchievements(childWalletAddress)
                .call();

            return achievements.map(id => id.toString());
        } catch (error) {
            this.logger.error('Failed to get child achievements:', error);
            throw error;
        }
    }

    async checkAchievementExists(childWalletAddress, achievementName) {
        try {
            if (!this.contracts.achievements) {
                throw new Error('Achievements contract not initialized');
            }

            return await this.contracts.achievements.methods
                .hasAchievement(childWalletAddress, achievementName)
                .call();
        } catch (error) {
            this.logger.error('Failed to check achievement existence:', error);
            throw error;
        }
    }

    // Certificate Functions
    async issueCertificate(childWalletAddress, certificateTypeId, wordsCompleted, accuracyAchieved, dataHash, ipfsHash) {
        try {
            if (!this.contracts.certificates) {
                throw new Error('Certificates contract not initialized');
            }

            const tx = await this.contracts.certificates.methods
                .issueCertificate(
                    childWalletAddress,
                    certificateTypeId,
                    wordsCompleted,
                    accuracyAchieved * 100, // Convert to basis points
                    dataHash,
                    ipfsHash
                )
                .send({
                    from: this.wallet.address,
                    gas: 600000,
                    gasPrice: await this.kit.connection.web3.eth.getGasPrice()
                });

            this.logger.info(`Certificate issued: ${tx.transactionHash}`);
            return {
                success: true,
                transactionHash: tx.transactionHash,
                blockNumber: tx.blockNumber,
                gasUsed: tx.gasUsed
            };
        } catch (error) {
            this.logger.error('Failed to issue certificate:', error);
            throw error;
        }
    }

    async verifyCertificate(instanceId, expectedDataHash) {
        try {
            if (!this.contracts.certificates) {
                throw new Error('Certificates contract not initialized');
            }

            const result = await this.contracts.certificates.methods
                .verifyCertificate(instanceId, expectedDataHash)
                .call();

            return {
                isValid: result.isValid,
                certificate: result.certificate
            };
        } catch (error) {
            this.logger.error('Failed to verify certificate:', error);
            throw error;
        }
    }

    async getChildCertificates(childWalletAddress) {
        try {
            if (!this.contracts.certificates) {
                throw new Error('Certificates contract not initialized');
            }

            const certificates = await this.contracts.certificates.methods
                .getChildCertificates(childWalletAddress)
                .call();

            return certificates.map(id => id.toString());
        } catch (error) {
            this.logger.error('Failed to get child certificates:', error);
            throw error;
        }
    }

    // Leaderboard Functions
    async updateLeaderboardScore(leaderboardId, childWalletAddress, score, wordsCompleted, accuracyPercentage, totalPlaytime) {
        try {
            if (!this.contracts.leaderboard) {
                throw new Error('Leaderboard contract not initialized');
            }

            const tx = await this.contracts.leaderboard.methods
                .updateScore(
                    leaderboardId,
                    childWalletAddress,
                    score,
                    wordsCompleted,
                    Math.floor(accuracyPercentage * 100), // Convert to basis points
                    totalPlaytime
                )
                .send({
                    from: this.wallet.address,
                    gas: 400000,
                    gasPrice: await this.kit.connection.web3.eth.getGasPrice()
                });

            this.logger.info(`Leaderboard updated: ${tx.transactionHash}`);
            return {
                success: true,
                transactionHash: tx.transactionHash,
                blockNumber: tx.blockNumber,
                gasUsed: tx.gasUsed
            };
        } catch (error) {
            this.logger.error('Failed to update leaderboard:', error);
            throw error;
        }
    }

    async getLeaderboard(leaderboardId, limit = 100) {
        try {
            if (!this.contracts.leaderboard) {
                throw new Error('Leaderboard contract not initialized');
            }

            const result = await this.contracts.leaderboard.methods
                .getLeaderboard(leaderboardId, limit)
                .call();

            return {
                wallets: result.wallets,
                scores: result.scores.map(s => s.toString()),
                ranks: result.ranks.map(r => r.toString())
            };
        } catch (error) {
            this.logger.error('Failed to get leaderboard:', error);
            throw error;
        }
    }

    async getChildLeaderboardEntry(leaderboardId, childWalletAddress) {
        try {
            if (!this.contracts.leaderboard) {
                throw new Error('Leaderboard contract not initialized');
            }

            const result = await this.contracts.leaderboard.methods
                .getChildEntry(leaderboardId, childWalletAddress)
                .call();

            return {
                entry: result.entry,
                rank: result.rank.toString()
            };
        } catch (error) {
            this.logger.error('Failed to get child leaderboard entry:', error);
            throw error;
        }
    }

    // Utility Functions
    async getTransactionReceipt(transactionHash) {
        try {
            return await this.kit.connection.web3.eth.getTransactionReceipt(transactionHash);
        } catch (error) {
            this.logger.error('Failed to get transaction receipt:', error);
            throw error;
        }
    }

    async estimateGas(contractMethod, fromAddress) {
        try {
            return await contractMethod.estimateGas({ from: fromAddress });
        } catch (error) {
            this.logger.error('Failed to estimate gas:', error);
            throw error;
        }
    }

    async getCurrentGasPrice() {
        try {
            return await this.kit.connection.web3.eth.getGasPrice();
        } catch (error) {
            this.logger.error('Failed to get gas price:', error);
            throw error;
        }
    }

    async getWalletBalance(walletAddress) {
        try {
            const balance = await this.kit.connection.web3.eth.getBalance(walletAddress);
            return this.kit.connection.web3.utils.fromWei(balance, 'ether');
        } catch (error) {
            this.logger.error('Failed to get wallet balance:', error);
            throw error;
        }
    }

    // Event Listening
    setupEventListeners() {
        try {
            if (this.contracts.achievements) {
                this.contracts.achievements.events.AchievementMinted()
                    .on('data', (event) => {
                        this.logger.info('Achievement minted event:', event.returnValues);
                        // Emit to application event system
                        this.emit('achievementMinted', event.returnValues);
                    })
                    .on('error', (error) => {
                        this.logger.error('Achievement event error:', error);
                    });
            }

            if (this.contracts.certificates) {
                this.contracts.certificates.events.CertificateIssued()
                    .on('data', (event) => {
                        this.logger.info('Certificate issued event:', event.returnValues);
                        this.emit('certificateIssued', event.returnValues);
                    })
                    .on('error', (error) => {
                        this.logger.error('Certificate event error:', error);
                    });
            }

            if (this.contracts.leaderboard) {
                this.contracts.leaderboard.events.ScoreUpdated()
                    .on('data', (event) => {
                        this.logger.info('Score updated event:', event.returnValues);
                        this.emit('scoreUpdated', event.returnValues);
                    })
                    .on('error', (error) => {
                        this.logger.error('Leaderboard event error:', error);
                    });
            }

            this.logger.info('Event listeners set up successfully');
        } catch (error) {
            this.logger.error('Failed to setup event listeners:', error);
        }
    }

    // Batch Operations for Efficiency
    async batchMintAchievements(mintRequests) {
        const results = [];
        
        for (const request of mintRequests) {
            try {
                const result = await this.mintAchievementNFT(
                    request.childWalletAddress,
                    request.achievementId,
                    request.metadataUri
                );
                results.push({ ...request, ...result, success: true });
            } catch (error) {
                results.push({ ...request, success: false, error: error.message });
            }
        }
        
        return results;
    }

    async batchUpdateLeaderboards(updateRequests) {
        const results = [];
        
        for (const request of updateRequests) {
            try {
                const result = await this.updateLeaderboardScore(
                    request.leaderboardId,
                    request.childWalletAddress,
                    request.score,
                    request.wordsCompleted,
                    request.accuracyPercentage,
                    request.totalPlaytime
                );
                results.push({ ...request, ...result, success: true });
            } catch (error) {
                results.push({ ...request, success: false, error: error.message });
            }
        }
        
        return results;
    }
}

// Make BlockchainService an EventEmitter
const { EventEmitter } = require('events');
Object.setPrototypeOf(BlockchainService.prototype, EventEmitter.prototype);

module.exports = new BlockchainService();