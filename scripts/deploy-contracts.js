const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🚀 Deploying SpellBloc contracts to Celo...');
    
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with account:', deployer.address);
    
    // Check balance
    const balance = await deployer.getBalance();
    console.log('Account balance:', ethers.utils.formatEther(balance), 'CELO');
    
    if (balance.lt(ethers.utils.parseEther('0.1'))) {
        throw new Error('Insufficient balance for deployment. Need at least 0.1 CELO');
    }

    const deployedContracts = {};
    
    try {
        // 1. Deploy SpellBlocRegistry first
        console.log('\n📋 Deploying SpellBlocRegistry...');
        const Registry = await ethers.getContractFactory('SpellBlocRegistry');
        const registry = await Registry.deploy();
        await registry.deployed();
        
        deployedContracts.registry = {
            address: registry.address,
            transactionHash: registry.deployTransaction.hash
        };
        console.log('✅ SpellBlocRegistry deployed to:', registry.address);
        
        // 2. Deploy SpellBlocAchievements
        console.log('\n🏆 Deploying SpellBlocAchievements...');
        const Achievements = await ethers.getContractFactory('SpellBlocAchievements');
        const achievements = await Achievements.deploy();
        await achievements.deployed();
        
        deployedContracts.achievements = {
            address: achievements.address,
            transactionHash: achievements.deployTransaction.hash
        };
        console.log('✅ SpellBlocAchievements deployed to:', achievements.address);
        
        // 3. Deploy SpellBlocCertificates
        console.log('\n📜 Deploying SpellBlocCertificates...');
        const Certificates = await ethers.getContractFactory('SpellBlocCertificates');
        const certificates = await Certificates.deploy();
        await certificates.deployed();
        
        deployedContracts.certificates = {
            address: certificates.address,
            transactionHash: certificates.deployTransaction.hash
        };
        console.log('✅ SpellBlocCertificates deployed to:', certificates.address);
        
        // 4. Deploy SpellBlocLeaderboard
        console.log('\n🏅 Deploying SpellBlocLeaderboard...');
        const Leaderboard = await ethers.getContractFactory('SpellBlocLeaderboard');
        const leaderboard = await Leaderboard.deploy();
        await leaderboard.deployed();
        
        deployedContracts.leaderboard = {
            address: leaderboard.address,
            transactionHash: leaderboard.deployTransaction.hash
        };
        console.log('✅ SpellBlocLeaderboard deployed to:', leaderboard.address);
        
        // 5. Initialize Registry with contract addresses
        console.log('\n🔗 Initializing Registry with contract addresses...');
        const initTx = await registry.initializePlatform(
            achievements.address,
            certificates.address,
            leaderboard.address
        );
        await initTx.wait();
        console.log('✅ Registry initialized with contract addresses');
        
        // 6. Set up authorized minters/issuers
        console.log('\n🔐 Setting up authorized addresses...');
        
        // Add deployer as authorized minter for achievements
        const addMinterTx = await achievements.addAuthorizedMinter(deployer.address);
        await addMinterTx.wait();
        console.log('✅ Added deployer as authorized minter for achievements');
        
        // Add deployer as authorized issuer for certificates
        const addIssuerTx = await certificates.addAuthorizedIssuer(deployer.address);
        await addIssuerTx.wait();
        console.log('✅ Added deployer as authorized issuer for certificates');
        
        // Add deployer as authorized updater for leaderboard
        const addUpdaterTx = await leaderboard.addAuthorizedUpdater(deployer.address);
        await addUpdaterTx.wait();
        console.log('✅ Added deployer as authorized updater for leaderboard');
        
        // 7. Create default achievement types
        console.log('\n🎯 Creating default achievement types...');
        await createDefaultAchievements(achievements);
        
        // 8. Create default certificate types
        console.log('\n📋 Creating default certificate types...');
        await createDefaultCertificates(certificates);
        
        // 9. Create default leaderboards
        console.log('\n🏆 Creating default leaderboards...');
        await createDefaultLeaderboards(leaderboard);
        
        // 10. Save deployment info
        const deploymentInfo = {
            network: await ethers.provider.getNetwork(),
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            contracts: deployedContracts,
            gasUsed: {
                registry: (await registry.deployTransaction.wait()).gasUsed.toString(),
                achievements: (await achievements.deployTransaction.wait()).gasUsed.toString(),
                certificates: (await certificates.deployTransaction.wait()).gasUsed.toString(),
                leaderboard: (await leaderboard.deployTransaction.wait()).gasUsed.toString()
            }
        };
        
        // Save to file
        const deploymentPath = path.join(__dirname, '../deployments');
        if (!fs.existsSync(deploymentPath)) {
            fs.mkdirSync(deploymentPath, { recursive: true });
        }
        
        const filename = `deployment-${deploymentInfo.network.name}-${Date.now()}.json`;
        fs.writeFileSync(
            path.join(deploymentPath, filename),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        // Create .env template
        const envTemplate = `
# SpellBloc Smart Contract Addresses (${deploymentInfo.network.name})
ACHIEVEMENTS_CONTRACT_ADDRESS=${achievements.address}
CERTIFICATES_CONTRACT_ADDRESS=${certificates.address}
LEADERBOARD_CONTRACT_ADDRESS=${leaderboard.address}
REGISTRY_CONTRACT_ADDRESS=${registry.address}

# Network Configuration
CELO_NETWORK=${deploymentInfo.network.name}
CELO_CHAIN_ID=${deploymentInfo.network.chainId}
`;
        
        fs.writeFileSync(
            path.join(__dirname, '../.env.contracts'),
            envTemplate.trim()
        );
        
        console.log('\n🎉 Deployment completed successfully!');
        console.log('\n📋 Contract Addresses:');
        console.log('Registry:', registry.address);
        console.log('Achievements:', achievements.address);
        console.log('Certificates:', certificates.address);
        console.log('Leaderboard:', leaderboard.address);
        
        console.log('\n💾 Deployment info saved to:', filename);
        console.log('📝 Environment variables saved to: .env.contracts');
        
        console.log('\n⚠️  Next Steps:');
        console.log('1. Add contract addresses to your .env file');
        console.log('2. Update your backend configuration');
        console.log('3. Test the contracts with the verification script');
        console.log('4. Set up monitoring and alerts');
        
    } catch (error) {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    }
}

async function createDefaultAchievements(achievements) {
    const defaultAchievements = [
        {
            id: 1,
            name: 'First Steps',
            description: 'Complete your first spelling word!',
            category: 'milestone',
            requirementValue: 1,
            rarity: 'common'
        },
        {
            id: 2,
            name: 'Word Explorer',
            description: 'Master 10 different words',
            category: 'milestone',
            requirementValue: 10,
            rarity: 'common'
        },
        {
            id: 3,
            name: 'Spelling Apprentice',
            description: 'Master 50 words',
            category: 'milestone',
            requirementValue: 50,
            rarity: 'rare'
        },
        {
            id: 4,
            name: 'Vocabulary Hero',
            description: 'Master 100 words',
            category: 'milestone',
            requirementValue: 100,
            rarity: 'rare'
        },
        {
            id: 5,
            name: 'Spelling Champion',
            description: 'Master 500 words',
            category: 'milestone',
            requirementValue: 500,
            rarity: 'epic'
        }
    ];
    
    for (const achievement of defaultAchievements) {
        try {
            const tx = await achievements.createAchievementType(
                achievement.id,
                achievement.name,
                achievement.description,
                achievement.category,
                achievement.requirementValue,
                achievement.rarity
            );
            await tx.wait();
            console.log(`✅ Created achievement: ${achievement.name}`);
        } catch (error) {
            console.log(`⚠️  Achievement ${achievement.name} may already exist`);
        }
    }
}

async function createDefaultCertificates(certificates) {
    const defaultCertificates = [
        {
            id: 1,
            title: 'Beginner Speller',
            description: 'Successfully completed beginner level spelling',
            level: 'beginner',
            skills: ['Basic letter recognition', 'Simple word spelling'],
            wordsRequired: 25,
            accuracyRequired: 8000, // 80%
            templateHash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('beginner-template'))
        },
        {
            id: 2,
            title: 'Intermediate Speller',
            description: 'Successfully completed intermediate level spelling',
            level: 'intermediate',
            skills: ['Complex word spelling', 'Pattern recognition'],
            wordsRequired: 100,
            accuracyRequired: 8500, // 85%
            templateHash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('intermediate-template'))
        },
        {
            id: 3,
            title: 'Advanced Speller',
            description: 'Successfully completed advanced level spelling',
            level: 'advanced',
            skills: ['Advanced vocabulary', 'Spelling mastery'],
            wordsRequired: 250,
            accuracyRequired: 9000, // 90%
            templateHash: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('advanced-template'))
        }
    ];
    
    for (const cert of defaultCertificates) {
        try {
            const tx = await certificates.createCertificateType(
                cert.id,
                cert.title,
                cert.description,
                cert.level,
                cert.skills,
                cert.wordsRequired,
                cert.accuracyRequired,
                cert.templateHash
            );
            await tx.wait();
            console.log(`✅ Created certificate: ${cert.title}`);
        } catch (error) {
            console.log(`⚠️  Certificate ${cert.title} may already exist`);
        }
    }
}

async function createDefaultLeaderboards(leaderboard) {
    const now = Math.floor(Date.now() / 1000);
    const oneWeek = 7 * 24 * 60 * 60;
    const oneMonth = 30 * 24 * 60 * 60;
    
    const defaultLeaderboards = [
        {
            id: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('global-weekly')),
            name: 'Global Weekly',
            description: 'Global weekly leaderboard for all players',
            type: 'global',
            period: 'weekly',
            startTime: now,
            endTime: now + oneWeek,
            maxEntries: 1000
        },
        {
            id: ethers.utils.keccak256(ethers.utils.toUtf8Bytes('global-monthly')),
            name: 'Global Monthly',
            description: 'Global monthly leaderboard for all players',
            type: 'global',
            period: 'monthly',
            startTime: now,
            endTime: now + oneMonth,
            maxEntries: 10000
        }
    ];
    
    for (const lb of defaultLeaderboards) {
        try {
            const tx = await leaderboard.createLeaderboard(
                lb.id,
                lb.name,
                lb.description,
                lb.type,
                lb.period,
                lb.startTime,
                lb.endTime,
                lb.maxEntries
            );
            await tx.wait();
            console.log(`✅ Created leaderboard: ${lb.name}`);
        } catch (error) {
            console.log(`⚠️  Leaderboard ${lb.name} may already exist`);
        }
    }
}

// Run deployment
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { main };