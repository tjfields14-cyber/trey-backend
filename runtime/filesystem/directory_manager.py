from pathlib import Path

def create_directory(path):

    try:

        Path(path).mkdir(
            parents=True,
            exist_ok=True
        )

        return "DIRECTORY CREATED"

    except Exception as error:

        return str(error)
