#!/bin/bash

# Setup script for PostgreSQL database initialization
set -e

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-sirsi_nexus}
DB_TEST_NAME=${DB_TEST_NAME:-sirsi_test}

echo "Setting up PostgreSQL databases..."

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER > /dev/null 2>&1; then
    echo "Error: PostgreSQL is not running on $DB_HOST:$DB_PORT"
    echo "Start PostgreSQL using: docker-compose up -d postgres"
    exit 1
fi

echo "PostgreSQL is running..."

# Create main database
echo "Creating database: $DB_NAME"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;" || echo "Database $DB_NAME already exists"

# Create test database
echo "Creating test database: $DB_TEST_NAME"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_TEST_NAME;" || echo "Database $DB_TEST_NAME already exists"

# Run migrations on main database
echo "Running migrations on $DB_NAME..."
for migration_file in ./migrations/*.sql; do
    if [ -f "$migration_file" ]; then
        echo "Applying migration: $(basename $migration_file)"
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration_file"
    fi
done

# Run migrations on test database
echo "Running migrations on $DB_TEST_NAME..."
for migration_file in ./migrations/*.sql; do
    if [ -f "$migration_file" ]; then
        echo "Applying migration to test DB: $(basename $migration_file)"
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_TEST_NAME -f "$migration_file"
    fi
done

echo "Database setup complete!"
echo ""
echo "Connection details:"
echo "  Main database: postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=disable"
echo "  Test database: postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_TEST_NAME?sslmode=disable"
echo ""
