import asyncio
import datetime

async def heartbeat():

    while True:

        print(
            f\"[HEARTBEAT] {datetime.datetime.now()}\"
        )

        await asyncio.sleep(5)

asyncio.run(heartbeat())