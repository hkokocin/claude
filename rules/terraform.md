---
paths:
  - "**/*.tf"
  - "**/*.tfvars"
---
# Terraform layout

- `~/projects/terraform-<name>/`: the Terraform module of project `<name>`.
- `~/projects/terraform/`: the main Terraform project. Every project module is integrated here, so a change to a module takes effect only once `~/projects/terraform` uses it.
