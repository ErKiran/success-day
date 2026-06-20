#!/usr/bin/env bash
set -e

echo "Starting Success Day..."

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Start Docker Desktop, then run ./start.sh again."
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Docker Compose is not installed. Install the Docker Compose plugin or Docker Desktop."
  exit 1
fi

"${COMPOSE[@]}" up -d keycloak-db keycloak
"${COMPOSE[@]}" run --rm keycloak-bootstrap
"${COMPOSE[@]}" up --build success-day-web
