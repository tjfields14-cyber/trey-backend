import time

from runtime.agents.task_queue import (
    get_task
)

from runtime.tools.router import (
    execute_tool
)

from runtime.state.runtime_state import (
    runtime_state
)

def execution_loop():

    while True:

        task = get_task()

        if task:

            runtime_state["signals"].append(

                f"[EXECUTION] {task}"
            )

            result = execute_tool(task)

            runtime_state["signals"].append(

                f"[RESULT] {result}"
            )

        time.sleep(1)