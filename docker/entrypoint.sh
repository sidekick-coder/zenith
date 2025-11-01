#!/bin/sh
set -e

# List of required directories in the storage folder
REQUIRED_DIRS="/app/storage/logs /app/storage/config /app/storage/tmp"

# Ensure each required directory exists
for dir in $REQUIRED_DIRS; do
  if [ ! -d "$dir" ]; then
    mkdir -p "$dir"
  fi
done

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
