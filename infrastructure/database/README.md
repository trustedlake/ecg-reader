# Database — PostgreSQL

PostgreSQL database for the leitor-ecg application, hosted on GCP Cloud SQL.

## Connection

```
Host:     <cloud-sql-ip>
Port:     5432
Database: leitor_ecg
User:     <service-account>
```

## Migrations

Migrations are managed with [golang-migrate](https://github.com/golang-migrate/migrate) or a custom Node.js script.

```bash
# Run all pending migrations
migrate -path infrastructure/database/migrations -database "$DATABASE_URL" up

# Rollback last migration
migrate -path infrastructure/database/migrations -database "$DATABASE_URL" down 1
```

## Schema Conventions

- All table names in `snake_case` (plural)
- Primary key: `id UUID DEFAULT gen_random_uuid()`
- Timestamps: `created_at`, `updated_at` with `DEFAULT NOW()`
- Soft delete: `deleted_at TIMESTAMP NULL`

## Local Development

```bash
# Start local PostgreSQL with Docker
docker run -d \
  --name leitor-ecg-pg \
  -e POSTGRES_DB=leitor_ecg \
  -e POSTGRES_USER=dev \
  -e POSTGRES_PASSWORD=dev \
  -p 5432:5432 \
  postgres:16
```
