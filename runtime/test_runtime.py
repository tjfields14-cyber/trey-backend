from runtime.services.service_registry import registry
from runtime.state.state_manager import state_manager

registry.register("backend", "online")
registry.register("websocket", "online")
registry.register("portal", "online")

state_manager.save(
    registry.all()
)

print(
    state_manager.load()
)