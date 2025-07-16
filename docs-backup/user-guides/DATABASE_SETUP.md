# CockroachDB Setup for Sirsi Nexus

This project uses CockroachDB as its primary database. CockroachDB is a distributed SQL database that's PostgreSQL-compatible, providing strong consistency and horizontal scalability.

## Quick Start

1. **Start the database services:**
   ```bash
   docker-compose up -d cockroachdb redis jaeger
   ```

2. **Initialize the databases:**
   ```bash
   cd core-engine
   ./scripts/setup-db.sh
   ```

3. **Verify the setup:**
   ```bash
   cockroach sql --insecure --host=localhost:26257 --execute="SHOW DATABASES;"
   ```

## Database Services

### CockroachDB (Main Database)
- **Port:** 26257 (SQL)
- **Admin UI:** http://localhost:8081
- **Connection:** `postgresql://root@localhost:26257/sirsi_nexus?sslmode=disable`
- **Mode:** Insecure (development only)

### Redis (Caching)
- **Port:** 6379
- **Use:** Session storage, caching, pub/sub

### Jaeger (Tracing)
- **UI Port:** 16686
- **OTLP gRPC:** 4317
- **OTLP HTTP:** 4318
- **UI:** http://localhost:16686

## Manual Database Setup

If you prefer to set up the database manually:

1. **Install CockroachDB:**
   ```bash
   # macOS
   brew install cockroachdb/tap/cockroach
   
   # Or download from: https://www.cockroachlabs.com/docs/releases/
   ```

2. **Start CockroachDB:**
   ```bash
   cockroach start-single-node --insecure --listen-addr=localhost:26257 --http-addr=localhost:8081
   ```

3. **Create databases:**
   ```bash
   cockroach sql --insecure --host=localhost:26257 --execute="CREATE DATABASE sirsi_nexus;"
   cockroach sql --insecure --host=localhost:26257 --execute="CREATE DATABASE sirsi_test;"
   ```

4. **Run migrations:**
   ```bash
   cd core-engine
   for file in migrations/*.sql; do
       cockroach sql --insecure --host=localhost:26257 --database=sirsi_nexus < "$file"
       cockroach sql --insecure --host=localhost:26257 --database=sirsi_test < "$file"
   done
   ```

## Environment Variables

Set these environment variables for custom configuration:

```bash
# Database connection
export DATABASE_URL="postgresql://root@localhost:26257/sirsi_nexus?sslmode=disable"
export TEST_DATABASE_URL="postgresql://root@localhost:26257/sirsi_test?sslmode=disable"

# For testing environment
export RUST_ENV="test"
```

## CockroachDB vs PostgreSQL

CockroachDB is PostgreSQL-compatible but has some differences:

### Similarities
- Uses PostgreSQL wire protocol
- Compatible with most PostgreSQL drivers (SQLx)
- Supports SQL transactions, JSONB, UUIDs

### Differences
- No PostgreSQL extensions (uuid-ossp, etc.)
- Uses `gen_random_uuid()` instead of `uuid_generate_v4()`
- Different performance characteristics
- Built-in distributed capabilities

## Testing

Run tests with the test database:

```bash
cd core-engine
RUST_ENV=test cargo test
```

For integration tests that require a database:

```bash
# Start test database
docker-compose --profile testing up -d cockroachdb-test

# Run database-dependent tests
cargo test --features database-tests
```

## Production Considerations

For production deployment:

1. **Enable security:**
   - Use certificates instead of `--insecure`
   - Configure proper SSL/TLS
   - Set up proper authentication

2. **Cluster setup:**
   - Deploy as a multi-node cluster
   - Configure load balancing
   - Set up backup and monitoring

3. **Performance:**
   - Tune connection pool settings
   - Monitor query performance
   - Consider read replicas for heavy read workloads

## Troubleshooting

### Database Connection Issues
```bash
# Check if CockroachDB is running
cockroach sql --insecure --host=localhost:26257 --execute="SELECT 1;"

# Check database status
cockroach node status --insecure --host=localhost:26257

# View logs
docker logs sirsi-cockroachdb
```

### Migration Issues
```bash
# Check migration status
cockroach sql --insecure --host=localhost:26257 --database=sirsi_nexus --execute="SHOW TABLES;"

# Reset database (development only)
cockroach sql --insecure --host=localhost:26257 --execute="DROP DATABASE IF EXISTS sirsi_nexus CASCADE; CREATE DATABASE sirsi_nexus;"
```

### Performance Issues
- Visit the Admin UI at http://localhost:8081
- Check the "Statements" page for slow queries
- Monitor connection pool usage
- Review database schema and indexes

## References

- [CockroachDB Documentation](https://www.cockroachlabs.com/docs/)
- [CockroachDB vs PostgreSQL](https://www.cockroachlabs.com/docs/stable/postgresql-compatibility.html)
- [SQLx with CockroachDB](https://docs.rs/sqlx/latest/sqlx/)
