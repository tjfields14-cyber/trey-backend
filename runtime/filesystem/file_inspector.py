from pathlib import Path

def inspect_file(filepath):

    try:

        path = Path(filepath)

        if not path.exists():

            return "FILE NOT FOUND"

        if path.is_dir():

            return "TARGET IS DIRECTORY"

        with open(
            path,
            "r",
            encoding="utf-8",
            errors="ignore"
        ) as file:

            return file.read(4000)

    except Exception as error:

        return str(error)
