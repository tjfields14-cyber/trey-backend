from pathlib import Path

def append_file(filepath, content):

    try:

        path = Path(filepath)

        with open(
            path,
            "a",
            encoding="utf-8"
        ) as file:

            file.write(content)

        return "APPEND SUCCESS"

    except Exception as error:

        return str(error)
