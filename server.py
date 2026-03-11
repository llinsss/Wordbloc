#!/usr/bin/env python3
"""
Simple HTTP Server for SpellBloc Development
Run this script to serve SpellBloc locally and avoid CORS issues.

Usage:
    python3 server.py
    
Then open: http://localhost:8000
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class SpellBlocHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        # Add PWA headers
        if self.path.endswith('.json'):
            self.send_header('Content-Type', 'application/json')
        elif self.path.endswith('.js'):
            self.send_header('Content-Type', 'application/javascript')
        
        super().end_headers()

def main():
    # Change to the directory containing this script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print(f"🎮 Starting SpellBloc Development Server...")
    print(f"📁 Serving from: {os.getcwd()}")
    print(f"🌐 Server URL: http://localhost:{PORT}")
    print(f"🚀 Opening browser...")
    print(f"⏹️  Press Ctrl+C to stop the server")
    
    try:
        with socketserver.TCPServer(("", PORT), SpellBlocHandler) as httpd:
            # Open browser automatically
            webbrowser.open(f'http://localhost:{PORT}')
            
            print(f"\n✅ SpellBloc is running at http://localhost:{PORT}")
            print(f"📱 For mobile testing, use your computer's IP address")
            print(f"🔄 Server will auto-reload when you refresh the browser")
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped by user")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use!")
            print(f"💡 Try closing other applications or use a different port")
            print(f"🔧 Or run: python3 server.py --port 8001")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Handle command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == "--help" or sys.argv[1] == "-h":
            print(__doc__)
            sys.exit(0)
        elif sys.argv[1] == "--port" and len(sys.argv) > 2:
            try:
                PORT = int(sys.argv[2])
            except ValueError:
                print("❌ Invalid port number")
                sys.exit(1)
    
    main()