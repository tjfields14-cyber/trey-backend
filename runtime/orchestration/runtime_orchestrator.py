class RuntimeOrchestrator:

    def __init__(self):

        self.services = []

    def register(self, service):

        self.services.append(service)

        print(f"[ORCHESTRATOR] Registered: {service}")

    def status(self):

        return {
            "services": self.services
        }

runtime_orchestrator = RuntimeOrchestrator()
