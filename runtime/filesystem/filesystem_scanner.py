from pathlib import Path

def scan_workspace():

    root = Path(".")

    files = []

    for path in root.rglob("*"):

        if path.is_file():

            files.append(
                str(path)
            )

    return files
