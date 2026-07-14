# Scripts

Utility scripts for deployment, database operations, and CI/CD.

## Available Scripts

| Script | Description |
|--------|-------------|
| `deploy.sh` | Build and deploy to GCP Cloud Run |
| `seed.sh` | Seed database with initial data |
| `backup.sh` | Create Cloud SQL backup |
| `migrate.sh` | Run database migrations |

## Usage

```bash
# Deploy to dev environment
bash infrastructure/scripts/deploy.sh dev

# Seed local database
bash infrastructure/scripts/seed.sh

# Create backup
bash infrastructure/scripts/backup.sh
```
