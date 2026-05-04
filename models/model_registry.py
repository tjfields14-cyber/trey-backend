class ModelRegistry:

    def __init__(self):

        self.models = []

    def register(self, model):

        self.models.append(model)

        print(f"[MODEL] Registered: {model}")

model_registry = ModelRegistry()
