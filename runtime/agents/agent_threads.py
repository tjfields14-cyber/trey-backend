import threading

from runtime.agents.execution_engine import (
    execution_loop
)

threads = []

def start_agent_threads():

    execution_thread = threading.Thread(

        target=execution_loop,

        daemon=True
    )

    execution_thread.start()

    threads.append(
        execution_thread
    )
