import asyncio
import datetime
import json
import threading
import websockets

from runtime.state.runtime_state import runtime_state

from runtime.filesystem.filesystem_scanner import (
    scan_workspace
)

from runtime.filesystem.file_inspector import (
    inspect_file
)

from runtime.filesystem.file_writer import (
    write_file
)

from runtime.filesystem.directory_manager import (
    create_directory
)

from runtime.filesystem.file_appender import (
    append_file
)

from runtime.agents.agent_threads import (
    start_agent_threads
)

from runtime.supervision.watchdog import (
    watchdog_loop
)

from cognition.reasoning.reasoning_engine import (
    reason
)

clients = set()

def start_runtime_threads():

    start_agent_threads()

    watchdog_thread = threading.Thread(

        target=watchdog_loop,

        daemon=True
    )

    watchdog_thread.start()

async def runtime_socket(websocket):

    clients.add(websocket)

    try:

        async for message in websocket:

            print(f"[SIGNAL] {message}")

            runtime_state["signals"].append(
                message
            )

            reason(message)

            if message.startswith("command:"):

                command = message.split(
                    ":",
                    1
                )[1]

                runtime_state["signals"].append(
                    f"COMMAND EXECUTED -> {command}"
                )

                if command == "status":

                    runtime_state["signals"].append(
                        "Runtime stable"
                    )

                elif command == "scan":

                    files = scan_workspace()

                    runtime_state["signals"].append(
                        f"FILES DETECTED -> {len(files)}"
                    )

                    runtime_state["filesystem"] = files[:100]

                elif command.startswith("inspect "):

                    filepath = command.replace(
                        "inspect ",
                        ""
                    )

                    content = inspect_file(
                        filepath
                    )

                    runtime_state[
                        "inspection"
                    ] = {

                        "file": filepath,

                        "content": content
                    }

                elif command.startswith("write "):

                    try:

                        payload = command.replace(
                            "write ",
                            ""
                        )

                        filepath, content = payload.split(
                            "::",
                            1
                        )

                        result = write_file(
                            filepath,
                            content
                        )

                        runtime_state["signals"].append(
                            result
                        )

                    except Exception as error:

                        runtime_state["signals"].append(
                            str(error)
                        )

                elif command.startswith("mkdir "):

                    path = command.replace(
                        "mkdir ",
                        ""
                    )

                    result = create_directory(
                        path
                    )

                    runtime_state["signals"].append(
                        result
                    )

                elif command.startswith("append "):

                    payload = command.replace(
                        "append ",
                        ""
                    )

                    filepath, content = payload.split(
                        "::",
                        1
                    )

                    result = append_file(
                        filepath,
                        content
                    )

                    runtime_state["signals"].append(
                        result
                    )

                elif command.startswith("delete "):

                    from pathlib import Path
                    import shutil

                    target = command.replace(
                        "delete ",
                        ""
                    )

                    path = Path(target)

                    if path.exists():

                        if path.is_file():

                            path.unlink()

                            runtime_state["signals"].append(
                                "FILE DELETED"
                            )

                        elif path.is_dir():

                            shutil.rmtree(path)

                            runtime_state["signals"].append(
                                "DIRECTORY DELETED"
                            )

                    else:

                        runtime_state["signals"].append(
                            "TARGET NOT FOUND"
                        )

                else:

                    runtime_state["signals"].append(
                        "Unknown command"
                    )

    finally:

        clients.remove(websocket)

async def runtime_broadcast():

    while True:

        payload = {

            "runtime": {

                "status": "online",

                "timestamp": str(
                    datetime.datetime.now()
                ),

                "signals": runtime_state.get(
                    "signals",
                    []
                ),

                "filesystem": runtime_state.get(
                    "filesystem",
                    []
                ),

                "inspection": runtime_state.get(
                    "inspection",
                    {}
                ),

                "heartbeat": runtime_state.get(
                    "heartbeat",
                    "offline"
                )
            }
        }

        dead_clients = set()

        for client in clients:

            try:

                await client.send(
                    json.dumps(payload)
                )

            except Exception:

                dead_clients.add(client)

        clients.difference_update(
            dead_clients
        )

        await asyncio.sleep(2)

async def main():

    start_runtime_threads()

    async with websockets.serve(

        runtime_socket,

        "0.0.0.0",

        8765
    ):

        print("[WEBSOCKET] Online")

        await runtime_broadcast()

asyncio.run(main())