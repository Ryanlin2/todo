terraform {
  # Backend blocks can't reference variables, so the bucket/key/table are
  # supplied at `terraform init` time via -backend-config. See
  # environments/backend-<env>.hcl and terraform/README.md.
  backend "s3" {}
}
