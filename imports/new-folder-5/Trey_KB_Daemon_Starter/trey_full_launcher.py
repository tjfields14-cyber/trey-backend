import subprocess
import threading
import time
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def start_server():
    subprocess.Popen(["python", "http_server.py"], cwd=BASE_DIR)

def start_widget():
    subprocess.Popen(["python", "trey_widget.py"], cwd=BASE_DIR)

# Start the server in a separate thread
threading.Thread(target=start_server).start()

# Wait for server to initialize
time.sleep(2)

# Launch widget
start_widget()
