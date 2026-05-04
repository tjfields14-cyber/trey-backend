from runtime.filesystem.filesystem_scanner import (
    scan_workspace
)

from runtime.filesystem.file_inspector import (
    inspect_file
)

from runtime.filesystem.file_writer import (
    write_file
)

from runtime.filesystem.file_appender import (
    append_file
)

from runtime.filesystem.directory_manager import (
    create_directory
)

def execute_tool(task):

    tool = task.get("tool")

    payload = task.get("payload")

    if tool == "scan":

        return scan_workspace()

    elif tool == "inspect":

        return inspect_file(payload)

    elif tool == "write":

        return write_file(

            payload["filepath"],

            payload["content"]
        )

    elif tool == "append":

        return append_file(

            payload["filepath"],

            payload["content"]
        )

    elif tool == "mkdir":

        return create_directory(payload)

    return "UNKNOWN TOOL"