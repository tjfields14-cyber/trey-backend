import tkinter as tk
from tkinter import ttk
from PIL import Image, ImageTk
import webbrowser
import os

PORT = 9880
AVATAR = "trey.png"  # Use your .png avatar file here

def search():
    query = entry.get()
    if query:
        url = f"http://127.0.0.1:{PORT}/search?q={query}"
        webbrowser.open(url)

root = tk.Tk()
root.title("Trey")
root.geometry("320x140+1200+100")
root.attributes("-topmost", True)
root.resizable(False, False)

# Style
style = ttk.Style()
style.configure("TEntry", padding=6, font=("Segoe UI", 12))
style.configure("TButton", padding=6, font=("Segoe UI", 10))

# Avatar
if os.path.exists(AVATAR):
    img = Image.open(AVATAR).resize((80, 80), Image.LANCZOS)
    avatar = ImageTk.PhotoImage(img)
    panel = ttk.Label(root, image=avatar)
    panel.image = avatar
    panel.pack(pady=(10, 5))

# Entry and Button
entry = ttk.Entry(root, width=28)
entry.pack(pady=(0, 6))
entry.focus()

btn = ttk.Button(root, text="Search Trey", command=search)
btn.pack()

# Enter key binding
root.bind("<Return>", lambda event: search())

root.mainloop()
