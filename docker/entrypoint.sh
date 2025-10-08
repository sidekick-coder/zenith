#!/bin/sh
set -e

# List of required directories in the storage folder
REQUIRED_DIRS="/app/storage/logs /app/storage/config /app/storage/tmp /app/storage/backups /app/storage/uploads"

# Ensure each required directory exists
for dir in $REQUIRED_DIRS; do
  if [ ! -d "$dir" ]; then
    mkdir -p "$dir"
  fi
done

# Check if dist directory exists, if not run build
if [ ! -d "/app/storage/dist" ]; then
  node arte build
fi

# If COMMANDS env var is set, execute each line as a command
if [ -n "$COMMANDS" ]; then
  echo "$COMMANDS" | while IFS= read -r cmd; do
    if [ -n "$cmd" ]; then
      echo "> $cmd"
      sh -c "$cmd"
    fi
  done
fi

exec "$@"
