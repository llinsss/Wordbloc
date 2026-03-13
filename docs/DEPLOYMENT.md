# SpellBloc Web3 Education Platform - Deployment Guide

## 🚀 Quick Start

### Prerequisites

1. **Node.js 18+** and **npm 8+**
2. **PostgreSQL 14+** database
3. **Redis 6+** for caching and sessions
4. **Celo wallet** with testnet CELO for contract deployment
5. **Domain name** (for production)

### Environment Setup

1. **Clone and Install Dependencies**
```bash
git clone https://github.com/spellbloc/platform.git
cd platform

# Backend setup
cd backend
npm install
cp .env.example .env

# Frontend setup (if using Next.js)
cd ../frontend
npm install
cp .env.example .env.local
```

2. **Configure Environment Variables**

Edit `backend/.env`:
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/spellbloc_prod"

# Celo Blockchain
CELO_NETWORK=alfajores  # or mainnet for production
CELO_PRIVATE_KEY=your-private-key-here
CELO_RPC_URL=https://alfajores-forno.celo-testnet.org

# Privy (Embedded Wallets)
PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# IPFS/Pinata
PINATA_API_KEY=your-pinata-api-key
PINATA_SECRET_API_KEY=your-pinata-secret-key

# Security
JWT_SECRET=your-super-secure-jwt-secret
WALLET_ENCRYPTION_KEY=your-32-byte-hex-encryption-key
SESSION_SECRET=your-session-secret
```

## 📊 Database Setup

### 1. Create Database
```bash
createdb spellbloc_prod
```

### 2. Run Migrations
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 3. Seed Initial Data
```bash
npm run seed
```

## 🔗 Smart Contract Deployment

### 1. Install Hardhat Dependencies
```bash
cd backend
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### 2. Configure Hardhat
Create `hardhat.config.js`:
```javascript
require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [process.env.CELO_PRIVATE_KEY],
      chainId: 44787
    },
    celo: {
      url: "https://forno.celo.org",
      accounts: [process.env.CELO_PRIVATE_KEY],
      chainId: 42220
    }
  }
};
```

### 3. Deploy Contracts
```bash
# Deploy to Alfajores testnet
npx hardhat run scripts/deploy-contracts.js --network alfajores

# Deploy to Celo mainnet (production)
npx hardhat run scripts/deploy-contracts.js --network celo
```

### 4. Update Environment with Contract Addresses
After deployment, add contract addresses to `.env`:
```bash
ACHIEVEMENTS_CONTRACT_ADDRESS=0x...
CERTIFICATES_CONTRACT_ADDRESS=0x...
LEADERBOARD_CONTRACT_ADDRESS=0x...
REGISTRY_CONTRACT_ADDRESS=0x...
```

## 🖥️ Backend Deployment

### Option 1: Railway (Recommended)

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository
   - Select the `backend` folder as root

2. **Configure Environment Variables**
   - Add all variables from `.env`
   - Set `NODE_ENV=production`

3. **Add Database**
   - Add PostgreSQL service
   - Add Redis service
   - Update `DATABASE_URL` and `REDIS_URL`

4. **Deploy**
   - Railway will automatically deploy on push

### Option 2: Heroku

1. **Create App**
```bash
heroku create spellbloc-backend
```

2. **Add Add-ons**
```bash
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini
```

3. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-jwt-secret
# ... add all other variables
```

4. **Deploy**
```bash
git push heroku main
```

### Option 3: VPS/Docker

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate

EXPOSE 3001
CMD ["npm", "start"]
```

2. **Create docker-compose.yml**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/spellbloc
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      POSTGRES_DB: spellbloc
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

3. **Deploy**
```bash
docker-compose up -d
```

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Import your repository
   - Set root directory to `frontend`

2. **Configure Environment Variables**
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
```

3. **Deploy**
   - Vercel will automatically deploy

### Option 2: Netlify

1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `out` or `dist`

2. **Environment Variables**
   - Add all `NEXT_PUBLIC_*` variables

## 🔧 Production Configuration

### 1. Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set secure session cookies
- [ ] Enable CORS properly
- [ ] Use strong JWT secrets
- [ ] Encrypt wallet private keys
- [ ] Enable rate limiting
- [ ] Set up monitoring (Sentry)

### 2. Performance Optimization

- [ ] Enable Redis caching
- [ ] Set up CDN (Cloudflare)
- [ ] Optimize database queries
- [ ] Enable compression
- [ ] Set up load balancing

### 3. Monitoring Setup

```bash
# Add to .env
SENTRY_DSN=your-sentry-dsn
MIXPANEL_TOKEN=your-mixpanel-token
```

### 4. Backup Strategy

```bash
# Database backup script
#!/bin/bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
aws s3 cp backup-$(date +%Y%m%d).sql s3://spellbloc-backups/
```

## 🧪 Testing Deployment

### 1. Health Checks
```bash
# Backend health
curl https://your-backend-url.com/health

# Contract verification
curl https://your-backend-url.com/api/blockchain/health
```

### 2. End-to-End Testing
```bash
# Run test suite
npm run test:e2e
```

### 3. Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

## 📈 Scaling Considerations

### Database Scaling
- Use read replicas for analytics queries
- Implement connection pooling
- Consider sharding for large datasets

### Blockchain Scaling
- Implement transaction queuing
- Use batch operations
- Monitor gas prices

### Application Scaling
- Horizontal scaling with load balancers
- Microservices architecture
- CDN for static assets

## 🔍 Monitoring & Maintenance

### 1. Application Monitoring
- **Uptime**: UptimeRobot or Pingdom
- **Errors**: Sentry
- **Performance**: New Relic or DataDog
- **Analytics**: Mixpanel (privacy-compliant)

### 2. Blockchain Monitoring
- **Contract Events**: Alchemy Notify
- **Gas Prices**: ETH Gas Station API
- **Transaction Status**: Custom monitoring

### 3. Database Monitoring
- **Performance**: pg_stat_statements
- **Backups**: Automated daily backups
- **Replication**: Monitor lag

## 🚨 Incident Response

### 1. Emergency Procedures
- **Contract Pause**: Emergency pause all contracts
- **Database Issues**: Switch to read-only mode
- **Security Breach**: Rotate all secrets

### 2. Rollback Strategy
- **Code Rollback**: Git-based deployment rollback
- **Database Rollback**: Point-in-time recovery
- **Contract Rollback**: Deploy new version (contracts are immutable)

## 📋 Post-Deployment Checklist

- [ ] All services are running
- [ ] Health checks pass
- [ ] SSL certificates are valid
- [ ] Monitoring is active
- [ ] Backups are configured
- [ ] Documentation is updated
- [ ] Team has access to all systems
- [ ] Emergency procedures are tested

## 🎯 Grant Compliance Setup

### 1. Analytics Configuration
```bash
# Enable grant reporting
GRANT_REPORTING_ENABLED=true
ANONYMIZE_DATA=true
RESEARCH_DATA_EXPORT_KEY=your-encryption-key
```

### 2. Data Export API
```bash
# Test data export
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://your-api.com/api/analytics/export/learning-data
```

### 3. Compliance Documentation
- Privacy policy implementation
- COPPA compliance verification
- Data retention policies
- Research data anonymization

## 🆘 Troubleshooting

### Common Issues

1. **Contract Deployment Fails**
   - Check CELO balance
   - Verify network configuration
   - Check gas limits

2. **Database Connection Issues**
   - Verify connection string
   - Check firewall rules
   - Confirm SSL settings

3. **Authentication Problems**
   - Verify JWT secrets
   - Check OAuth configuration
   - Confirm session settings

### Support Resources

- **Documentation**: [docs.spellbloc.com](https://docs.spellbloc.com)
- **Community**: [Discord](https://discord.gg/spellbloc)
- **Issues**: [GitHub Issues](https://github.com/spellbloc/platform/issues)

---

## 🎉 Congratulations!

Your SpellBloc Web3 Education Platform is now deployed and ready to help children learn spelling while building a transparent, grant-eligible educational ecosystem.

**Next Steps:**
1. Test all functionality thoroughly
2. Set up monitoring and alerts
3. Create user documentation
4. Plan marketing and user acquisition
5. Apply for educational grants