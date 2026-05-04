from fastapi import FastAPI

app = FastAPI()

@app.get("/")

def root():

    return {
        "runtime": "PEARL.ai",
        "status": "online"
    }
