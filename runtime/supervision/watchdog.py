import time

from runtime.state.runtime_state import (
    runtime_state
)

def watchdog_loop():

    while True:

        runtime_state[
            "heartbeat"
        ] = "alive"

        time.sleep(3)
