---
paths:
  - "**/*.tf"
  - "**/*.tfvars"
---
# Terraform layout

- `~/projects/terraform-<name>/`: the Terraform module of project `<name>`.
- `~/projects/terraform/`: the main Terraform project. It integrates every project module, so a module change takes effect only once the main project uses it.
