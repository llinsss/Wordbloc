# 🚀 SpellBloc Setup Guide

## Quick Start Options

### Option 1: Simple File Opening (Limited Features)
1. Double-click `index.html` to open in your browser
2. ⚠️ **Note**: Some advanced features won't work due to browser security restrictions

### Option 2: Local Development Server (Recommended)
Choose one of these methods for full functionality:

#### Method A: Python Server (Easiest)
```bash
# Navigate to the game folder
cd /Users/user/Desktop/game2

# Start the server
python3 server.py

# Browser will open automatically at http://localhost:8000
```

#### Method B: Node.js Server
```bash
# Navigate to the game folder
cd /Users/user/Desktop/game2

# Start the server
node server.js

# Browser will open automatically at http://localhost:8000
```

#### Method C: Live Server (VS Code Extension)
1. Install "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"

#### Method D: Simple HTTP Server
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have http-server installed)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

## 🌐 Mobile Testing

To test on mobile devices:
1. Start local server (any method above)
2. Find your computer's IP address:
   - **Mac/Linux**: `ifconfig | grep inet`
   - **Windows**: `ipconfig`
3. On mobile, visit: `http://YOUR_IP_ADDRESS:8000`

## 🔧 Troubleshooting

### CORS Errors
**Problem**: "Access to ... has been blocked by CORS policy"
**Solution**: Use a local server (Option 2) instead of opening files directly

### Service Worker Errors
**Problem**: "Failed to register a ServiceWorker"
**Solution**: This is normal when opening files directly. Use a local server for PWA features.

### Missing Files Errors
**Problem**: "Failed to load resource: net::ERR_FILE_NOT_FOUND"
**Solution**: These are optional assets. The game will work without them.

### Port Already in Use
**Problem**: "Port 8000 is already in use"
**Solutions**:
- Close other applications using port 8000
- Use a different port: `python3 server.py --port 8001`
- Or: `PORT=8001 node server.js`

## 📱 Installing as PWA

1. Open SpellBloc in Chrome/Edge/Safari via local server
2. Look for "Install" button in address bar
3. Click to install as native app
4. Access from desktop/home screen

## 🎯 Features Available by Method

| Feature | File Opening | Local Server |
|---------|-------------|--------------|
| Basic Gameplay | ✅ | ✅ |
| Adaptive Learning | ✅ | ✅ |
| Multi-Language | ✅ | ✅ |
| Parent Dashboard | ✅ | ✅ |
| Accessibility | ✅ | ✅ |
| PWA Installation | ❌ | ✅ |
| Service Worker | ❌ | ✅ |
| Full Offline Mode | ❌ | ✅ |
| Cloud Sync Simulation | ❌ | ✅ |

## 🎮 First Time Setup

1. **Choose your method** (local server recommended)
2. **Select child's age** (2-7 years)
3. **Pick a language** (English, Spanish, French, German, Chinese)
4. **Choose game mode** (Classic, Story, Speed, Puzzles)
5. **Start playing!**

## 👨👩👧👦 Parent Dashboard Access

1. Click the 📈 button in the top-right corner
2. View progress, achievements, and recommendations
3. Add custom word lists
4. Export progress reports

## 🔒 Privacy & Safety

- **No internet required** - works completely offline
- **No data collection** - all progress saved locally
- **COPPA compliant** - safe for children
- **No ads or tracking** - distraction-free learning

## 🆘 Need Help?

1. **Check this guide** for common solutions
2. **Try different browsers** (Chrome, Firefox, Safari, Edge)
3. **Use local server** for full functionality
4. **Clear browser cache** if experiencing issues

## 🎉 You're Ready!

SpellBloc is now ready to provide world-class spelling education for your child. Enjoy the learning journey! 🌟📚✨