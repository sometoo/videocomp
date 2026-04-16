# server.py - 로컬 테스트용 서버 (COOP/COEP 헤더 포함)
# 사용법: python server.py
# 접속: http://127.0.0.1:8765/video_compressor.html

from http.server import HTTPServer, SimpleHTTPRequestHandler

class COIHandler(SimpleHTTPRequestHandler):
    """Cross-Origin Isolation 헤더를 추가하는 로컬 테스트 서버"""

    def end_headers(self):
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        super().end_headers()

    def log_message(self, format, *args):
        print(f'[서버] {self.address_string()} - {format % args}')

if __name__ == '__main__':
    port = 8765
    server = HTTPServer(('127.0.0.1', port), COIHandler)
    print(f'[OK] server running: http://127.0.0.1:{port}/video_compressor.html')
    print('Stop: Ctrl+C')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped.')
