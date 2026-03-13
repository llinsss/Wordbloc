const { ethers } = require('ethers');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const winston = require('winston');

const prisma = new PrismaClient();

class WalletService {
    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            defaultMeta: { service: 'wallet-service' },
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'logs/wallet.log' })
            ]
        });
        this.encryptionKey = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Initialize encryption key from environment
            this.encryptionKey = process.env.WALLET_ENCRYPTION_KEY || this.generateEncryptionKey();
            
            if (!process.env.WALLET_ENCRYPTION_KEY) {
                this.logger.warn('No WALLET_ENCRYPTION_KEY found in environment. Generated temporary key.');
                this.logger.warn('Set WALLET_ENCRYPTION_KEY in production for persistent wallet access.');
            }
            
            this.isInitialized = true;
            this.logger.info('Wallet service initialized');
        } catch (error) {
            this.logger.error('Failed to initialize wallet service:', error);
            throw error;
        }
    }

    generateEncryptionKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Encrypt private key for storage
    encryptPrivateKey(privateKey) {
        try {
            const algorithm = 'aes-256-gcm';
            const iv = crypto.randomBytes(16);
            const key = Buffer.from(this.encryptionKey, 'hex');
            
            const cipher = crypto.createCipher(algorithm, key);
            cipher.setAAD(Buffer.from('spellbloc-wallet', 'utf8'));
            
            let encrypted = cipher.update(privateKey, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const authTag = cipher.getAuthTag();
            
            return {
                encrypted,
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex')
            };
        } catch (error) {
            this.logger.error('Failed to encrypt private key:', error);
            throw error;
        }
    }

    // Decrypt private key for use
    decryptPrivateKey(encryptedData) {
        try {
            const algorithm = 'aes-256-gcm';
            const key = Buffer.from(this.encryptionKey, 'hex');
            const iv = Buffer.from(encryptedData.iv, 'hex');
            const authTag = Buffer.from(encryptedData.authTag, 'hex');
            
            const decipher = crypto.createDecipher(algorithm, key);
            decipher.setAAD(Buffer.from('spellbloc-wallet', 'utf8'));
            decipher.setAuthTag(authTag);
            
            let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            this.logger.error('Failed to decrypt private key:', error);
            throw error;
        }
    }

    // Create new custodial wallet for user/child
    async createWallet(userId = null, childId = null) {
        try {
            if (!userId && !childId) {
                throw new Error('Either userId or childId must be provided');
            }
            
            if (userId && childId) {
                throw new Error('Cannot provide both userId and childId');
            }

            // Check if wallet already exists
            const existingWallet = await prisma.wallet.findFirst({
                where: {
                    OR: [
                        { userId: userId },
                        { childId: childId }
                    ]
                }
            });

            if (existingWallet) {
                throw new Error('Wallet already exists for this user/child');
            }

            // Generate new wallet
            const wallet = ethers.Wallet.createRandom();
            
            // Encrypt private key
            const encryptedPrivateKey = this.encryptPrivateKey(wallet.privateKey);
            
            // Store in database
            const dbWallet = await prisma.wallet.create({
                data: {
                    userId,
                    childId,
                    walletAddress: wallet.address,
                    encryptedPrivateKey: JSON.stringify(encryptedPrivateKey),
                    chain: 'celo',
                    isActive: true,
                    nonce: 0
                }
            });

            this.logger.info(`Created wallet for ${userId ? 'user' : 'child'}: ${wallet.address}`);
            
            return {
                id: dbWallet.id,
                walletAddress: wallet.address,
                chain: dbWallet.chain,
                createdAt: dbWallet.createdAt
            };
        } catch (error) {
            this.logger.error('Failed to create wallet:', error);
            throw error;
        }
    }

    // Get wallet for user/child
    async getWallet(userId = null, childId = null) {
        try {
            const wallet = await prisma.wallet.findFirst({
                where: {
                    OR: [
                        { userId: userId },
                        { childId: childId }
                    ],
                    isActive: true
                }
            });

            if (!wallet) {
                return null;
            }

            return {
                id: wallet.id,
                walletAddress: wallet.walletAddress,
                chain: wallet.chain,
                createdAt: wallet.createdAt,
                nonce: wallet.nonce
            };
        } catch (error) {
            this.logger.error('Failed to get wallet:', error);
            throw error;
        }
    }

    // Get wallet with decrypted private key (for transactions)
    async getWalletWithPrivateKey(userId = null, childId = null) {
        try {
            const wallet = await prisma.wallet.findFirst({
                where: {
                    OR: [
                        { userId: userId },
                        { childId: childId }
                    ],
                    isActive: true
                }
            });

            if (!wallet) {
                throw new Error('Wallet not found');
            }

            // Decrypt private key
            const encryptedData = JSON.parse(wallet.encryptedPrivateKey);
            const privateKey = this.decryptPrivateKey(encryptedData);
            
            // Create ethers wallet instance
            const ethersWallet = new ethers.Wallet(privateKey);

            return {
                id: wallet.id,
                walletAddress: wallet.walletAddress,
                privateKey: privateKey,
                ethersWallet: ethersWallet,
                chain: wallet.chain,
                nonce: wallet.nonce
            };
        } catch (error) {
            this.logger.error('Failed to get wallet with private key:', error);
            throw error;
        }
    }

    // Create wallet for child when they're registered
    async createChildWallet(childId) {
        try {
            const child = await prisma.child.findUnique({
                where: { id: childId }
            });

            if (!child) {
                throw new Error('Child not found');
            }

            const wallet = await this.createWallet(null, childId);
            
            this.logger.info(`Created wallet for child ${child.name}: ${wallet.walletAddress}`);
            
            return wallet;
        } catch (error) {
            this.logger.error('Failed to create child wallet:', error);
            throw error;
        }
    }

    // Create wallet for parent when they register
    async createParentWallet(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                throw new Error('User not found');
            }

            const wallet = await this.createWallet(userId, null);
            
            this.logger.info(`Created wallet for user ${user.email}: ${wallet.walletAddress}`);
            
            return wallet;
        } catch (error) {
            this.logger.error('Failed to create parent wallet:', error);
            throw error;
        }
    }

    // Get all wallets for a parent (including children)
    async getParentWallets(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    wallet: true,
                    children: {
                        include: {
                            wallet: true
                        }
                    }
                }
            });

            if (!user) {
                throw new Error('User not found');
            }

            const wallets = [];
            
            // Add parent wallet
            if (user.wallet) {
                wallets.push({
                    type: 'parent',
                    owner: user.name,
                    ownerId: user.id,
                    walletAddress: user.wallet.walletAddress,
                    chain: user.wallet.chain,
                    createdAt: user.wallet.createdAt
                });
            }

            // Add children wallets
            user.children.forEach(child => {
                if (child.wallet) {
                    wallets.push({
                        type: 'child',
                        owner: child.name,
                        ownerId: child.id,
                        walletAddress: child.wallet.walletAddress,
                        chain: child.wallet.chain,
                        createdAt: child.wallet.createdAt
                    });
                }
            });

            return wallets;
        } catch (error) {
            this.logger.error('Failed to get parent wallets:', error);
            throw error;
        }
    }

    // Update wallet nonce after transaction
    async updateWalletNonce(walletAddress, newNonce) {
        try {
            await prisma.wallet.update({
                where: { walletAddress },
                data: { nonce: newNonce }
            });

            this.logger.info(`Updated nonce for wallet ${walletAddress}: ${newNonce}`);
        } catch (error) {
            this.logger.error('Failed to update wallet nonce:', error);
            throw error;
        }
    }

    // Deactivate wallet (soft delete)
    async deactivateWallet(walletAddress) {
        try {
            await prisma.wallet.update({
                where: { walletAddress },
                data: { isActive: false }
            });

            this.logger.info(`Deactivated wallet: ${walletAddress}`);
        } catch (error) {
            this.logger.error('Failed to deactivate wallet:', error);
            throw error;
        }
    }

    // Get wallet statistics
    async getWalletStats() {
        try {
            const stats = await prisma.wallet.groupBy({
                by: ['chain', 'isActive'],
                _count: {
                    id: true
                }
            });

            const totalWallets = await prisma.wallet.count();
            const activeWallets = await prisma.wallet.count({
                where: { isActive: true }
            });

            return {
                totalWallets,
                activeWallets,
                inactiveWallets: totalWallets - activeWallets,
                byChain: stats.reduce((acc, stat) => {
                    if (!acc[stat.chain]) {
                        acc[stat.chain] = { active: 0, inactive: 0 };
                    }
                    if (stat.isActive) {
                        acc[stat.chain].active = stat._count.id;
                    } else {
                        acc[stat.chain].inactive = stat._count.id;
                    }
                    return acc;
                }, {})
            };
        } catch (error) {
            this.logger.error('Failed to get wallet stats:', error);
            throw error;
        }
    }

    // Batch create wallets for multiple children
    async batchCreateChildWallets(childIds) {
        const results = [];
        
        for (const childId of childIds) {
            try {
                const wallet = await this.createChildWallet(childId);
                results.push({ childId, wallet, success: true });
            } catch (error) {
                results.push({ childId, success: false, error: error.message });
            }
        }
        
        return results;
    }

    // Validate wallet address format
    isValidWalletAddress(address) {
        try {
            return ethers.utils.isAddress(address);
        } catch (error) {
            return false;
        }
    }

    // Generate wallet recovery phrase (for advanced users)
    generateRecoveryPhrase() {
        try {
            const wallet = ethers.Wallet.createRandom();
            return {
                mnemonic: wallet.mnemonic.phrase,
                address: wallet.address,
                privateKey: wallet.privateKey
            };
        } catch (error) {
            this.logger.error('Failed to generate recovery phrase:', error);
            throw error;
        }
    }

    // Import wallet from recovery phrase
    async importWalletFromMnemonic(mnemonic, userId = null, childId = null) {
        try {
            const wallet = ethers.Wallet.fromMnemonic(mnemonic);
            
            // Check if wallet already exists
            const existingWallet = await prisma.wallet.findUnique({
                where: { walletAddress: wallet.address }
            });

            if (existingWallet) {
                throw new Error('Wallet already exists in system');
            }

            // Encrypt private key
            const encryptedPrivateKey = this.encryptPrivateKey(wallet.privateKey);
            
            // Store in database
            const dbWallet = await prisma.wallet.create({
                data: {
                    userId,
                    childId,
                    walletAddress: wallet.address,
                    encryptedPrivateKey: JSON.stringify(encryptedPrivateKey),
                    chain: 'celo',
                    isActive: true,
                    nonce: 0
                }
            });

            this.logger.info(`Imported wallet: ${wallet.address}`);
            
            return {
                id: dbWallet.id,
                walletAddress: wallet.address,
                chain: dbWallet.chain,
                createdAt: dbWallet.createdAt
            };
        } catch (error) {
            this.logger.error('Failed to import wallet from mnemonic:', error);
            throw error;
        }
    }

    // Health check
    async checkHealth() {
        try {
            if (!this.isInitialized) return false;
            
            // Test encryption/decryption
            const testPrivateKey = '0x' + crypto.randomBytes(32).toString('hex');
            const encrypted = this.encryptPrivateKey(testPrivateKey);
            const decrypted = this.decryptPrivateKey(encrypted);
            
            if (testPrivateKey !== decrypted) {
                throw new Error('Encryption/decryption test failed');
            }
            
            // Test database connection
            await prisma.wallet.count();
            
            return true;
        } catch (error) {
            this.logger.error('Wallet service health check failed:', error);
            return false;
        }
    }
}

module.exports = new WalletService();