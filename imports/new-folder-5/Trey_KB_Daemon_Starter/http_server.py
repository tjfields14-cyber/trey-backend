#!/usr/bin/env python3
# http_server.py — chatty KB search server with clear errors

import json, urllib.parse, sys, socket
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from datetime import datetime, UTC
import yaml

CFG = yaml.safe_load(open("config.yaml", "r", encoding="utf-8"))
HOST = CFG.get("http", {}).get("host", "127.0.0.1")
PORT = int(CFG.get("http", {}).get("port", 9876))
INDEX_PATH = Path(CFG.get("index_path", "./kb_index.json")).resolve()

def now():
    return datetime.now(UTC).isoformat()

class Handler(BaseHTTPRequestHandler):
    def _json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        # Print cleaner server logs
        sys.stdout.write(f"[{now()}] {self.address_string()} - " + fmt%args + "\n")

    def do_GET(self):
        if self.path.startswith("/health"):
            return self._json({"ok": True, "updated": now()})
        if self.path.startswith("/search"):
            q = urllib.parse.parse_qs(urllib.parse.urlsplit(self.path).query).get("q", [""])[0].strip().lower()
            try:
                data = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
            except FileNotFoundError:
                return self._json({"error":"index not found", "path": str(INDEX_PATH)}, 404)
            except Exception as e:
                return self._json({"error": f"index read error: {e.__class__.__name__}: {e}"}, 500)

            docs = data.get("docs", [])
            if not q:
                return self._json({"q": q, "results": docs[:20]})
            hits = []
            for d in docs:
                hay = " ".join([d.get("title",""), " ".join(d.get("tags",[])), d.get("text","")]).lower()
                if q in hay:
                    hits.append(d)
            return self._json({"q": q, "results": hits[:50]})
        return self._json({"error":"not found"}, 404)

def main():
    print(f"[{now()}] Starting KB server on http://{HOST}:{PORT}")
    print(f"[{now()}] Index file: {INDEX_PATH}")
    try:
        httpd = HTTPServer((HOST, PORT), Handler)
    except OSError as e:
        print(f"[{now()}] ERROR: could not bind to {HOST}:{PORT} — {e.__class__.__name__}: {e}")
        print(f"[{now()}] Tip: edit config.yaml -> http.port to a free port (e.g., 9880), then re-run: python http_server.py")
        sys.exit(1)

    try:
        print(f"[{now()}] Listening… (Ctrl+C to stop)")
        httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n[{now()}] Stopping server…")
    finally:
        httpd.server_close()
        print(f"[{now()}] Server closed.")

if __name__ == "__main__":
    main()
