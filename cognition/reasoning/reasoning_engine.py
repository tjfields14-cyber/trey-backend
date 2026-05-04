from runtime.state.runtime_state import (
    runtime_state
)

def reason(signal):

    if "Unknown command" in signal:

        runtime_state["signals"].append(

            "[REASONING] Suggesting valid commands"
        )

    elif "FILES DETECTED" in signal:

        runtime_state["signals"].append(

            "[REASONING] Filesystem indexed"
        )

    elif "WRITE SUCCESS" in signal:

        runtime_state["signals"].append(

            "[REASONING] Mutation confirmed"
        )
