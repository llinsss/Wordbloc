# SpellBloc Web3 Education Platform

## Project Structure

```
spellbloc-platform/
├── frontend/                    # React/Next.js frontend
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── SignupForm.jsx
│   │   │   └── GoogleAuth.jsx
│   │   ├── game/
│   │   │   ├── GameScreen.jsx
│   │   │   ├── WordDisplay.jsx
│   │   │   ├── LetterBank.jsx
│   │   │   └── ProgressTracker.jsx
│   │   ├── dashboard/
│   │   │   ├── ParentDashboard.jsx
│   │   │   ├── ChildProfile.jsx
│   │   │   ├── ProgressChart.jsx
│   │   │   ├── AchievementsPanel.jsx
│   │   │   └── CertificatesPanel.jsx
│   │   ├── teacher/
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── ClassroomManager.jsx
│   │   │   └── StudentProgress.jsx
│   │   └── shared/
│   │       ├── Badge.jsx
│   │       ├── Certificate.jsx
│   │       └── Leaderboard.jsx
│   ├── pages/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── game/
│   │   │   ├── achievements/
│   │   │   └── certificates/
│   │   ├── game/
│   │   ├── dashboard/
│   │   └── teacher/
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useGameProgress.js
│   │   └── useAchievements.js
│   ├── utils/
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── constants.js
│   └── styles/
│       ├── globals.css
│       └── components/
├── backend/                     # Node.js/Express backend
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── gameController.js
│   │   ├── achievementController.js
│   │   ├── certificateController.js
│   │   └── leaderboardController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Child.js
│   │   ├── GameSession.js
│   │   ├── Achievement.js
│   │   ├── Certificate.js
│   │   └── Wallet.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── game.js
│   │   ├── achievements.js
│   │   └── certificates.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── coppa.js
│   ├── services/
│   │   ├── walletService.js
│   │   ├── nftService.js
│   │   ├── certificateService.js
│   │   └── blockchainService.js
│   ├── utils/
│   │   ├── encryption.js
│   │   ├── ipfs.js
│   │   └── constants.js
│   └── config/
│       ├── database.js
│       ├── blockchain.js
│       └── privy.js
├── contracts/                   # Solidity smart contracts
│   ├── SpellBlocAchievements.sol
│   ├── SpellBlocCertificates.sol
│   ├── SpellBlocLeaderboard.sol
│   └── SpellBlocRegistry.sol
├── scripts/                     # Deployment scripts
│   ├── deploy-contracts.js
│   ├── setup-database.js
│   └── migrate-data.js
├── docs/                        # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── WEB3_INTEGRATION.md
│   └── GRANT_COMPLIANCE.md
├── tests/
│   ├── frontend/
│   ├── backend/
│   └── contracts/
├── docker-compose.yml
├── package.json
└── README.md
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS + Custom CSS
- **State Management**: Zustand
- **Authentication**: NextAuth.js + Privy
- **Charts**: Chart.js/Recharts
- **Mobile**: PWA support

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Privy embedded wallets
- **File Storage**: IPFS (Pinata)
- **Caching**: Redis
- **Queue**: Bull Queue for blockchain operations

### Blockchain
- **Network**: Celo Mainnet/Alfajores Testnet
- **Wallet**: Privy embedded wallets (custodial)
- **Standards**: ERC-721 (NFTs), ERC-1155 (Certificates)
- **Storage**: IPFS for metadata
- **SDK**: Celo SDK, ethers.js

### Infrastructure
- **Hosting**: Vercel (frontend) + Railway (backend)
- **Database**: Supabase PostgreSQL
- **CDN**: Cloudflare
- **Monitoring**: Sentry
- **Analytics**: Mixpanel (privacy-compliant)

## Key Features

### Web2 User Experience
- Email/Google authentication
- No crypto terminology visible to users
- Traditional educational game interface
- Parent dashboard with familiar metrics

### Web3 Backend Infrastructure
- Automatic wallet creation (custodial)
- NFT achievement badges (invisible to users)
- Blockchain-verified certificates
- Transparent leaderboards
- Grant-compliant data export

### Educational Features
- Age-appropriate curriculum (2-7 years)
- Progress tracking and analytics
- Achievement system with badges
- Learning certificates
- Teacher classroom management
- Leaderboards and competitions

### Compliance & Security
- COPPA-compliant data handling
- Encrypted private key storage
- Privacy-first analytics
- Grant-ready reporting
- Audit trail on blockchain