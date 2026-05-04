import asyncio
import datetime

from runtime.services.service_registry import registry
from runtime.state.state_manager import state_manager

registry.register("heartbeat", "online")

async def heartbeat():

    while True:

        timestamp = str(datetime.datetime.now())

        registry.register(
            "last_heartbeat",
            timestamp
        )

        state_manager.save(
            registry.all()
        )

        print(
            f"[HEARTBEAT] {timestamp}"
        )

        await asyncio.sleep(5)

asyncio.run(heartbeat())