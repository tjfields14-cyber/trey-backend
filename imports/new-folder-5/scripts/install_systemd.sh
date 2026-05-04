#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-$HOME/Trey_KB_Daemon_Starter}"
SERVICE_NAME="trey-kb.service"

echo "Installing systemd unit to ~/.config/systemd/user or /etc/systemd/system ..."

if systemctl --user >/dev/null 2>&1; then
  mkdir -p ~/.config/systemd/user
  sed "s|WorkingDirectory=%h/Trey_KB_Daemon_Starter|WorkingDirectory=${PROJECT_ROOT}|g" scripts/trey-kb.service > ~/.config/systemd/user/${SERVICE_NAME}
  systemctl --user daemon-reload
  echo "Installed to user systemd. Use: systemctl --user enable trey-kb.service && systemctl --user start trey-kb.service"
else
  sudo mkdir -p /etc/systemd/system
  sudo sed "s|WorkingDirectory=%h/Trey_KB_Daemon_Starter|WorkingDirectory=${PROJECT_ROOT}|g" scripts/trey-kb.service > /etc/systemd/system/${SERVICE_NAME}
  sudo systemctl daemon-reload
  echo "Installed to system systemd. Use: sudo systemctl enable trey-kb.service && sudo systemctl start trey-kb.service"
fi
