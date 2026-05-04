# Trey KnowledgeBase Daemon — Starter Kit

This kit sets up a background-like service for **Trey (Personal Assistant)** to ingest and index your KnowledgeBase files continuously on your own machine or server.

> Runs locally under your control (Windows or Linux). The daemon watches your KnowledgeBase directory for changes, ingests Markdown/TXT/Docs metadata, and maintains a searchable index + change log that Trey can consult during sessions.

## What it does
- Watches `KnowledgeBase_AI/` for new/changed files
- Extracts clean text from `.md` and `.txt` (stub hooks for `.docx`, `.pdf`)
- Normalizes front‑matter (YAML/JSON blocks) into metadata
- Maintains `kb_index.json` (and optional `kb_index.sqlite` in future)
- Appends to `kb_activity.log` with timestamped events
- Exposes a tiny **local HTTP endpoint** (optional) to query the KB: `GET /search?q=term`

## Folder layout
```
Trey_KB_Daemon_Starter/
  README.md
  requirements.txt
  config.yaml
  kb_daemon.py
  http_server.py
  scripts/
    install_systemd.sh
    trey-kb.service
    install_windows.ps1
  sample_notes/
    000_welcome.md
```

## Quick start (both platforms)
1. Install Python 3.10+
2. `pip install -r requirements.txt`
3. Edit `config.yaml` (set `kb_root` to your path)
4. Run the daemon: `python kb_daemon.py`
5. (Optional) Run the tiny HTTP server: `python http_server.py`
6. Verify `kb_activity.log` and `kb_index.json` are being updated

## Linux (systemd) install
```bash
chmod +x scripts/install_systemd.sh
sudo ./scripts/install_systemd.sh
# then:
sudo systemctl enable trey-kb.service
sudo systemctl start trey-kb.service
sudo systemctl status trey-kb.service
```

## Windows install (Scheduled Task)
Open **PowerShell as Administrator**:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
.\scripts\install_windows.ps1 -PythonPath "C:\Python310\python.exe" -ProjectRoot "C:\path	o\Trey_KB_Daemon_Starter"
# This registers a task "TreyKBDaemon" that starts at logon and repeats every 5 minutes
```

## Querying locally (optional)
If you start `http_server.py`, you can hit:
- `http://127.0.0.1:9876/search?q=angelic%20essence`
- `http://127.0.0.1:9876/health`

The server reads `kb_index.json` and returns simple JSON results.

## Notes
- This kit is designed to be simple and auditable. It does **not** upload data anywhere.
- To add additional parsers (DOCX, PDF), extend the `parse_file` stub in `kb_daemon.py`.
- For large corpora, swap `kb_index.json` for SQLite or a vector DB — hooks are included as TODOs.

