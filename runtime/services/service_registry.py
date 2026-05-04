class ServiceRegistry:

    def __init__(self):
        self.services = {}

    def register(self, name, status):

        self.services[name] = status

        print(f"[REGISTERED] {name}")

    def get(self, name):
        return self.services.get(name)

    def all(self):
        return self.services

registry = ServiceRegistry()