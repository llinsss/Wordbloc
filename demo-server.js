const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

// Serve static files
app.use(express.static(__dirname));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/auth-demo', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth-demo.html'));
});

// Mock API endpoints for demonstration
app.use(express.json());

app.post('/api/auth/login', (req, res) => {
    const { provider, token } = req.body;
    
    // Simulate authentication
    setTimeout(() => {
        res.json({
            success: true,
            user: {
                id: 'user_123',
                name: 'Demo User',
                email: 'demo@spellbloc.com',
                provider: provider
            },
            jwt: 'mock-jwt-token-' + Date.now()
        });
    }, 1000);
});

app.post('/api/children', (req, res) => {
    const { name, age } = req.body;
    
    // Simulate child profile creation with custodial wallet
    setTimeout(() => {
        res.json({
            success: true,
            child: {
                id: 'child_' + Date.now(),
                name: name,
                age: age,
                walletAddress: '0x' + Math.random().toString(16).substr(2, 40),
                createdAt: new Date().toISOString()
            }
        });
    }, 500);
});

app.listen(PORT, () => {
    console.log(`🎮 SpellBloc Demo Server running at:`);
    console.log(`   Main Game: http://localhost:${PORT}`);
    console.log(`   Auth Demo: http://localhost:${PORT}/auth-demo`);
    console.log(`\n🔐 Authentication Demo Features:`);
    console.log(`   • Google OAuth simulation`);
    console.log(`   • Child profile management`);
    console.log(`   • Custodial wallet creation`);
    console.log(`   • Blockchain integration (backend)`);
    console.log(`   • COPPA-compliant flow`);
});