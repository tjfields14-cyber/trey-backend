import json

MEMORY_PATH = "memory/runtime_memory.json"

def load_memory():

    with open(MEMORY_PATH, "r") as file:

        return json.load(file)

def save_memory(data):

    with open(MEMORY_PATH, "w") as file:

        json.dump(
            data,
            file,
            indent=2
        )
