from runtime.nodes.node_registry import node_registry

node_registry.register(
    "local-node",
    "online"
)

print(node_registry.all())
