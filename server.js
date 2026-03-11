#!/usr/bin/env node
/**
 * Simple HTTP Server for SpellBloc Development
 * Node.js version for users who prefer Node over Python
 * 
 * Usage:
 *   node server.js
 *   
 * Then open: http://localhost:8000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 8000;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
    // Add CORS headers for development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Parse URL and remove query parameters
    let filePath = req.url.split('?')[0];
    
    // Default to index.html for root requests
    if (filePath === '/') {
        filePath = '/index.html';
    }
    
    // Construct full file path
    const fullPath = path.join(__dirname, filePath);
    
    // Get file extension for MIME type
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Check if file exists
    fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (err) {
            // File not found
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <html>
                    <head><title>404 - Not Found</title></head>
                    <body>
                        <h1>🚫 File Not Found</h1>
                        <p>The requested file <code>${filePath}</code> was not found.</p>
                        <p><a href="/">← Back to SpellBloc</a></p>
                    </body>
                </html>
            `);
            return;
        }
        
        // Read and serve the file
        fs.readFile(fullPath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <head><title>500 - Server Error</title></head>
                        <body>
                            <h1>⚠️ Server Error</h1>
                            <p>Error reading file: ${err.message}</p>
                            <p><a href="/">← Back to SpellBloc</a></p>
                        </body>
                    </html>
                `);
                return;
            }
            
            // Set content type and serve file
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });
});

// Start server
server.listen(PORT, () => {
    console.log('🎮 Starting SpellBloc Development Server...');
    console.log(`📁 Serving from: ${__dirname}`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log('🚀 Opening browser...');
    console.log('⏹️  Press Ctrl+C to stop the server');
    
    // Open browser automatically
    const start = process.platform === 'darwin' ? 'open' : 
                  process.platform === 'win32' ? 'start' : 'xdg-open';
    
    exec(`${start} http://localhost:${PORT}`, (err) => {
        if (err) {
            console.log('💡 Please manually open: http://localhost:' + PORT);
        }
    });
    
    console.log(`\n✅ SpellBloc is running at http://localhost:${PORT}`);
    console.log('📱 For mobile testing, use your computer\'s IP address');
    console.log('🔄 Server will auto-reload when you refresh the browser');
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
    console.log('\n🛑 Server stopped by user');
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${PORT} is already in use!`);
        console.log('💡 Try closing other applications or use a different port');
        console.log('🔧 Or run: PORT=8001 node server.js');
    } else {
        console.log('❌ Error starting server:', err.message);
    }
    process.exit(1);
});