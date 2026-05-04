import subprocess, time, webbrowser, os, sys, urllib.request

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PYTHON = sys.executable   # use the same Python that runs this launcher
PORT = 9880

KB_DAEMON  = os.path.join(BASE_DIR, "kb_daemon.py")
HTTP_SERVER = os.path.join(BASE_DIR, "http_server.py")

def start(cmd):
    # start a child process, no console noise
    return subprocess.Popen(cmd, cwd=BASE_DIR,
                            stdout=subprocess.DEVNULL,
                            stderr=subprocess.DEVNULL)

# start the daemon
start([PYTHON, KB_DAEMON])
time.sleep(2)

# start the HTTP server
start([PYTHON, HTTP_SERVER])

# wait briefly for /health to respond
for _ in range(15):
    try:
        urllib.request.urlopen(f"http://127.0.0.1:{PORT}/health", timeout=1)
        break
    except Exception:
        time.sleep(1)

# open a test search in the browser
webbrowser.open(f"http://127.0.0.1:{PORT}/search?q=stop")
