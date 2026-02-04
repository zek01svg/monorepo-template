#!/usr/bin/env bash
# Use this script to start a docker container for a local development database

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux) - https://learn.microsoft.com/en-us/windows/wsl/install
# 2. Install Docker Desktop for Windows - https://docs.docker.com/docker-for-windows/install/
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS you can run this script directly - `./start-database.sh`

DB_NAME="monorepo-template"
DB_CONTAINER_NAME="$DB_NAME-postgres"

if ! [ -x "$(command -v docker)" ]; then
  echo -e "Docker is not installed. Please install docker and try again.\nDocker install guide: https://docs.docker.com/engine/install/"
  exit 1
fi

if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
  echo "Database container '$DB_CONTAINER_NAME' already running"
  exit 0
fi

if [ "$(docker ps -q -a -f name=$DB_CONTAINER_NAME)" ]; then
  docker start "$DB_CONTAINER_NAME"
  echo "Existing database container '$DB_CONTAINER_NAME' started"
  exit 0
fi

# import env variables from .env
set -a
source .env

# Extract database connection details from PostgreSQL URL
# Remove protocol part
DB_URL_NO_PROTOCOL=$(echo "$AUTH_POSTGRES_URL" | sed 's|postgresql://||' | sed 's|postgres://||')

# Extract user:password part (before @)
DB_AUTH_PART=$(echo "$DB_URL_NO_PROTOCOL" | awk -F'@' '{print $1}')
DB_USER=$(echo "$DB_AUTH_PART" | awk -F':' '{print $1}')
DB_PASSWORD=$(echo "$DB_AUTH_PART" | awk -F':' '{print $2}')

# Extract host:port/database part (after @)
DB_HOST_PART=$(echo "$DB_URL_NO_PROTOCOL" | awk -F'@' '{print $2}')
DB_PORT=$(echo "$DB_HOST_PART" | awk -F':' '{print $2}' | awk -F'/' '{print $1}')

# Create data directory if it doesn't exist
mkdir -p ./data/databases

docker run -d \
  --name $DB_CONTAINER_NAME \
  -e POSTGRES_USER="$DB_USER" \
  -e POSTGRES_PASSWORD="$DB_PASSWORD" \
  -e POSTGRES_DB=$DB_NAME \
  -p "$DB_PORT":5432 \
  -v "$(pwd)/data/databases:/var/lib/postgresql/data" \
  docker.io/postgres && echo "Database container '$DB_CONTAINER_NAME' was successfully created"

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker exec $DB_CONTAINER_NAME pg_isready -U "$DB_USER" > /dev/null 2>&1; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Extract all environment variables ending with POSTGRES_URL and create their databases
echo "Creating databases from POSTGRES_URL environment variables..."

# Get all environment variables ending with POSTGRES_URL
POSTGRES_URLS=$(env | grep '_POSTGRES_URL=' | cut -d'=' -f1)

if [ -z "$POSTGRES_URLS" ]; then
  echo "No environment variables ending with POSTGRES_URL found"
  exit 0
fi

# Process each POSTGRES_URL variable
for url_var in $POSTGRES_URLS; do
  echo "Processing $url_var..."
  
  # Get the value of the environment variable
  url_value=$(eval echo \$$url_var)
  
  if [ -z "$url_value" ]; then
    echo "Warning: $url_var is empty, skipping..."
    continue
  fi
  
  # Extract database name from the URL
  # Format: postgresql://user:password@host:port/database_name
  database_name=$(echo "$url_value" | sed 's|.*://.*@.*/||' | sed 's|?.*||')
  
  if [ -z "$database_name" ]; then
    echo "Warning: Could not extract database name from $url_var, skipping..."
    continue
  fi
  
  echo "Creating database: $database_name (from $url_var)"
  
  # Create the database if it doesn't exist
  docker exec $DB_CONTAINER_NAME psql -U "$DB_USER" -c "CREATE DATABASE \"$database_name\";" 2>/dev/null || \
  echo "Database '$database_name' already exists or could not be created"
done

echo "Database creation process completed!"
