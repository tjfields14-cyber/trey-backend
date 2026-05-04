#!/usr/bin/env python3
# kb_daemon.py — Trey KnowledgeBase daemon (Windows-safe, Python 3.13-ready)

import os, time, json, re, threading
from pathlib import Path
from datetime import datetime, UTC
from queue import Queue

import yaml
from watchdog.events import FileSystemEventHandler
from watchdog.observers.polling import PollingObserver  # portable & stable on Windows

# -------- config --------
CONFIG = yaml.safe_load(open("config.yaml", "r", encoding="utf-8"))
KB_ROOT   = Path(CONFIG["kb_root"]).resolve()
INDEX_PATH = Path(CONFIG["index_path"]).resolve()
LOG_PATH   = Path(CONFIG["log_path"]).resolve()
IGNORE     = CONFIG.get("ignore_globs", [])
EXTS       = set(e.lower() for e in CONFIG.get("extensions", [".md", ".txt"]))

EVENT_QUEUE: "Queue[tuple[str, Path]]" = Queue()
INDEX: dict[str, dict] = {}


# -------- utils --------
def log(msg: str) -> None:
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"[{datetime.now(UTC).isoformat()}] {msg}\n")


def sha256_bytes(b: bytes) -> str:
    import hashlib
    h = hashlib.sha256(); h.update(b); return h.hexdigest()


def parse_front_matter(text: str):
    """
    Extract simple YAML front-matter of the form:
    ---
    key: value
    ---
    <body>
    """
    if text.startswith("---"):
        m = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", text, flags=re.S)
        if m:
            try:
                meta = yaml.safe_load(m.group(1)) or {}
            except Exception:
                meta = {}
            return meta, m.group(2)
    return {}, text


def should_ignore(path: Path) -> bool:
    p = path.as_posix()
    for pat in IGNORE:
        # very simple glob-ish matcher
        rx = pat.replace(".", r"\.").replace("**", ".*").replace("*", "[^/]*")
        if re.search(rx, p):
            return True
    return False


def parse_file(path: Path):
    """Return a record with minimal searchable fields, or None on error."""
    try:
        data = path.read_bytes()
        checksum = sha256_bytes(data)
        text = data.decode("utf-8", errors="ignore")
        meta, body = parse_front_matter(text)
        title = (meta.get("title") or path.stem).strip()
        tags = meta.get("tags") or []
        body = re.sub(r"\s+\n", "\n", body).strip()
        return {
            "id": checksum[:16],
            "path": str(path),
            "title": title,
            "tags": tags,
            "text": body,
            "checksum": checksum,
            "mtime": datetime.fromtimestamp(path.stat().st_mtime, UTC).isoformat(),
        }
    except Exception as e:
        log(f"ERROR parsing {path}: {e}")
        return None


def persist_index() -> None:
    INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump(
            {"updated": datetime.now(UTC).isoformat(), "docs": list(INDEX.values())},
            f,
            ensure_ascii=False,
            indent=2,
        )


def full_scan() -> None:
    docs = 0
    for p in KB_ROOT.rglob("*"):
        if p.is_file() and p.suffix.lower() in EXTS and not should_ignore(p):
            rec = parse_file(p)
            if rec:
                INDEX[rec["path"]] = rec
                docs += 1
    log(f"Full scan completed: {docs} docs")
    persist_index()


# -------- watcher --------
class KBHandler(FileSystemEventHandler):
    def on_any_event(self, event):
        if event.is_directory:
            return
        EVENT_QUEUE.put(("change", Path(event.src_path)))


def worker():
    while True:
        evt, path = EVENT_QUEUE.get()
        try:
            if evt == "change" and path.exists() and path.suffix.lower() in EXTS and not should_ignore(path):
                rec = parse_file(path)
                if rec:
                    prev = INDEX.get(rec["path"])
                    INDEX[rec["path"]] = rec
                    persist_index()
                    if prev and prev["checksum"] != rec["checksum"]:
                        log(f"UPDATED {path}")
                    elif not prev:
                        log(f"NEW {path}")
        finally:
            EVENT_QUEUE.task_done()


# -------- main --------
def main():
    KB_ROOT.mkdir(parents=True, exist_ok=True)
    full_scan()

    t = threading.Thread(target=worker, daemon=True)
    t.start()

    handler = KBHandler()
    observer = PollingObserver()  # force polling for Windows/Python 3.13 stability
    observer.schedule(handler, str(KB_ROOT), recursive=True)
    observer.start()
    log(f"Watching {KB_ROOT}")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()


if __name__ == "__main__":
    main()
