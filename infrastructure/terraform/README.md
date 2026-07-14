# Terraform — Infrastructure as Code

Manages GCP resources for the leitor-ecg application.

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/downloads) >= 1.6
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- GCP project with billing enabled

## Quick Start

```bash
# Authenticate with GCP
gcloud auth application-default login

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply infrastructure
terraform apply
```

## Resources

| Resource | Description |
|----------|-------------|
| Cloud Run | Serverless container for the React app + API |
| Cloud SQL | PostgreSQL instance |
| Cloud Storage | Bucket for ECG image uploads |
| VPC | Network configuration |

## Structure

```
infrastructure/terraform/
├── main.tf           # Root module
├── variables.tf      # Input variables
├── outputs.tf        # Output values
├── modules/
│   ├── compute/      # Cloud Run service
│   ├── database/     # Cloud SQL + PG config
│   └── storage/      # GCS bucket + IAM
└── environments/
    ├── dev/
    ├── staging/
    └── prod/
```
