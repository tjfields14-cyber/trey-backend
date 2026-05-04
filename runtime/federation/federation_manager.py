class FederationManager:

    def __init__(self):

        self.federated_nodes = []

    def connect(self, node):

        self.federated_nodes.append(node)

        print(f"[FEDERATION] Connected: {node}")

federation_manager = FederationManager()
