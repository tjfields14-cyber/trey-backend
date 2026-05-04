import os

# Define all folders to create
folders = {
    "Trey_KB_Daemon_Starter": [
        "sample_notes",
        "scripts"
    ],
    "KnowledgeBase_AI": [
        "data",
        "logs",
        "models",
        "snapshots",
        "index",
        "scripts",
        "output"
    ]
}

# Function to create folder and add default files
def create_structure(base_path, folder_map):
    for root, subfolders in folder_map.items():
        root_path = os.path.join(base_path, root)
        os.makedirs(root_path, exist_ok=True)
        with open(os.path.join(root_path, ".gitkeep"), "w") as f:
            pass
        with open(os.path.join(root_path, "README.md"), "w") as f:
            f.write(f"# {root}\n\nThis folder contains files for the {root} component.")

        for sub in subfolders:
            sub_path = os.path.join(root_path, sub)
            os.makedirs(sub_path, exist_ok=True)
            with open(os.path.join(sub_path, ".gitkeep"), "w") as f:
                pass
            with open(os.path.join(sub_path, "README.md"), "w") as f:
                f.write(f"# {sub}\n\nThis is the `{sub}` folder inside `{root}`.")

# Run it in user's Documents folder
if __name__ == "__main__":
    base_dir = os.path.expanduser("~/Documents")
    create_structure(base_dir, folders)
    print(f"✅ Project folders and base files created successfully in {base_dir}")
