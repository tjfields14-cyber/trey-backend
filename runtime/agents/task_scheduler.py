from runtime.agents.task_queue import (
    add_task
)

def schedule_task(
    tool,
    payload=None
):

    add_task({

        "tool": tool,

        "payload": payload
    })
