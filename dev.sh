#!/usr/bin/env bash
set -e

# ── Entorno ──────────────────────────────────────────────────────────────────
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "Creado backend/.env desde .env.example — revisa API_KEY si lo necesitas."
fi

# ── Docker ───────────────────────────────────────────────────────────────────
docker compose up --build "$@"
