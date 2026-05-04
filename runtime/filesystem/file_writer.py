from pathlib import Path

def write_file(filepath, content):

    try:

        path = Path(filepath)

        path.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        with open(
            path,
            "w",
            encoding="utf-8"
        ) as file:

            file.write(content)

        return "WRITE SUCCESS"

    except Exception as error:

        return str(error)
