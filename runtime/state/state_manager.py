import json

class StateManager:

    def __init__(self):
        self.path = "runtime_state.json"

    def save(self, state):

        with open(self.path, "w") as f:
            json.dump(state, f, indent=4)

        print("[STATE SAVED]")

    def load(self):

        try:

            with open(self.path, "r") as f:
                return json.load(f)

        except:
            return {}

state_manager = StateManager()