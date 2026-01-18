#!/usr/bin/env python3
"""
Simple HTTP server for viewing the Sirsi pitch deck
"""
import http.server
import socketserver
import os
import webbrowser
from threading import Timer

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

def open_browser():
    webbrowser.open(f'http://localhost:{PORT}/premium-deck.html')

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 Sirsi Pitch Deck Server")
        print(f"📍 Serving at http://localhost:{PORT}")
        print(f"📄 Open http://localhost:{PORT}/premium-deck.html to view the deck")
        print(f"⌨️  Press Ctrl+C to stop the server")
        
        # Open browser after 1 second
        Timer(1, open_browser).start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped")
