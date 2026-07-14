# Monitoring

## Metrics

| Metric | Dashboard | Alert Threshold |
|--------|-----------|----------------|
| Request latency (p95) | Cloud Monitoring | > 500ms |
| Error rate | Cloud Monitoring | > 1% |
| CPU usage | Cloud Run dashboard | > 80% |
| Memory usage | Cloud Run dashboard | > 80% |
| DB connections | Cloud SQL dashboard | > 80% of max |
| Disk usage | Cloud SQL dashboard | > 85% |

## Alerts

- **High latency**: P1 — notify #on-call
- **Error rate spike**: P1 — notify #on-call
- **DB connection pool full**: P2 — notify team
- **Disk space low**: P2 — notify team

## Logs

- Application logs: Cloud Logging (`resource.type = "cloud_run_revision"`)
- Database logs: Cloud Logging (`resource.type = "cloudsql_database"`)

## Runbook

1. **Latency spike**: Check DB query performance, review recent deploys
2. **Errors**: Check logs for stack traces, verify upstream dependencies
3. **DB full**: Run `VACUUM ANALYZE`, increase disk size if needed
