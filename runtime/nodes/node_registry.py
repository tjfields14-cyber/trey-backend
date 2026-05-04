class NodeRegistry:

    def __init__(self):

        self.nodes = {}

    def register(self, node, status):

        self.nodes[node] = status

        print(f"[NODE] {node}: {status}")

    def all(self):

        return self.nodes

node_registry = NodeRegistry()
