"""Local UI fixture. Never included in the extension release."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path == '/preview':
            page = (ROOT / 'popup.html').read_text(encoding='utf-8')
            page = page.replace('<script src="popup.js">', '<script src="tests/fixture.js"></script><script src="popup.js">')
            data = page.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(data)
        else:
            super().do_GET()

server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
print(f'http://127.0.0.1:{server.server_port}/preview', flush=True)
server.serve_forever()
