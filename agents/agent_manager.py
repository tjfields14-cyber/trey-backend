class AgentManager:

    def __init__(self):

        self.agents = []

    def load(self, agent):

        self.agents.append(agent)

        print(f"[AGENT] Loaded: {agent}")

agent_manager = AgentManager()
