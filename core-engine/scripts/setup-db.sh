#!/bin/bash

# Setup script for CockroachDB database initialization
set -e

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-26257}
DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-sirsi_nexus}
DB_TEST_NAME=${DB_TEST_NAME:-sirsi_test}

echo "Setting up CockroachDB databases..."

# Check if CockroachDB is running
if ! cockroach sql --insecure --host=$DB_HOST:$DB_PORT --execute="SELECT 1;" > /dev/null 2>&1; then
    echo "Error: CockroachDB is not running on $DB_HOST:$DB_PORT"
    echo "Start CockroachDB using: docker-compose up -d cockroachdb"
    exit 1
fi

echo "CockroachDB is running..."

# Create main database
echo "Creating database: $DB_NAME"
cockroach sql --insecure --host=$DB_HOST:$DB_PORT --execute="
CREATE DATABASE IF NOT EXISTS $DB_NAME;
"

# Create test database
echo "Creating test database: $DB_TEST_NAME"
cockroach sql --insecure --host=$DB_HOST:$DB_PORT --execute="
CREATE DATABASE IF NOT EXISTS $DB_TEST_NAME;
"

# Run migrations on main database
echo "Running migrations on $DB_NAME..."
for migration_file in ./migrations/*.sql; do
    if [ -f "$migration_file" ]; then
        echo "Applying migration: $(basename $migration_file)"
        cockroach sql --insecure --host=$DB_HOST:$DB_PORT --database=$DB_NAME < "$migration_file"
    fi
done

# Run migrations on test database
echo "Running migrations on $DB_TEST_NAME..."
for migration_file in ./migrations/*.sql; do
    if [ -f "$migration_file" ]; then
        echo "Applying migration to test DB: $(basename $migration_file)"
        cockroach sql --insecure --host=$DB_HOST:$DB_PORT --database=$DB_TEST_NAME < "$migration_file"
    fi
done

echo "Database setup complete!"
echo ""
echo "Connection details:"
echo "  Main database: postgresql://root@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=disable"
echo "  Test database: postgresql://root@$DB_HOST:$DB_PORT/$DB_TEST_NAME?sslmode=disable"
echo ""
echo "CockroachDB Admin UI: http://$DB_HOST:8080"
