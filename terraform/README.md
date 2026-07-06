# Infrastructure as Code

Provisions ECR + a VPC + an ECS Fargate service (behind an ALB) for todo-app.

Current scope deliberately skips RDS: the app still uses the `better-sqlite3`
file (`todos.db`), which does **not** persist across Fargate task restarts or
redeploys, and won't work correctly with more than one running task. This is
accepted for now to get a working deploy path; revisit before running this in
anything that needs real data durability (options: mount an EFS volume for
the SQLite file, or migrate to RDS Postgres/MySQL).

## One-time setup: state backend

Terraform state is stored remotely (S3 + DynamoDB lock table) so it isn't
just a file on someone's laptop. That backend has to exist before it can be
referenced, so it's a separate, one-off apply:

```bash
cd terraform/bootstrap
terraform init
terraform apply -var="state_bucket_name=<globally-unique-bucket-name>"
```

Then put that bucket name into both
`terraform/environments/backend-staging.hcl` and `backend-prod.hcl`
(replacing `REPLACE_ME-todo-app-tfstate`).

## Day to day

```bash
cd terraform

# staging
terraform init -backend-config=environments/backend-staging.hcl -reconfigure
terraform plan  -var-file=environments/staging.tfvars
terraform apply -var-file=environments/staging.tfvars

# prod
terraform init -backend-config=environments/backend-prod.hcl -reconfigure
terraform plan  -var-file=environments/prod.tfvars
terraform apply -var-file=environments/prod.tfvars
```

Each environment gets its own state file (`todo-app/staging/...` vs
`todo-app/prod/...` inside the same bucket), so staging and prod can never
collide or overwrite each other's state.

After `apply`, `terraform output alb_dns_name` gives you the URL to hit.

## Getting an image into ECR

The task definition points at `<ecr_repository_url>:<image_tag>` (default
tag: `latest`). Until CI pushes automatically, do it manually:

```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build --target production -t todo-app .
docker tag todo-app:latest <ecr_repository_url>:latest
docker push <ecr_repository_url>:latest
```

Then `terraform apply` (or `aws ecs update-service --force-new-deployment`)
to roll it out.
