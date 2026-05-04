import subprocess
import threading
import time
import os

BASE = os.path.dirname(os.path.abspath(__file__))

def start_server():
    subprocess.Popen(["python", "http_server.py"], cwd=BASE)

def start_widget():
    subprocess.Popen(["python", "trey_widget.py"], cwd=BASE)

# Start server first
threading.Thread(target=start_server).start()

# Small delay to give it time to boot
time.sleep(1.5)

# Start the GUI
start_widget()
