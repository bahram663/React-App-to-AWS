variable "project_name" {
  description = "Short name used to prefix every resource. Lowercase letters, digits and hyphens only."
  type        = string
  default     = "atlas-dashboard"

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$", var.project_name))
    error_message = "project_name must be 3-32 chars of lowercase letters, digits or hyphens, and cannot start or end with a hyphen."
  }
}

variable "environment" {
  description = "Deployment environment. Becomes part of resource names and tags."
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod."
  }
}

variable "aws_region" {
  description = "Region for the S3 origin bucket and logs. CloudFront itself is global."
  type        = string
  default     = "eu-central-1"
}

variable "domain_name" {
  description = <<-EOT
    Optional custom domain for the distribution, e.g. "dashboard.example.com".
    Leave empty to use the default *.cloudfront.net name and skip ACM entirely.
    When set, Terraform requests a DNS-validated certificate in us-east-1; if
    `route53_zone_id` is also set the validation records are created for you,
    otherwise add them manually and the apply will wait.
  EOT
  type        = string
  default     = ""
}

variable "route53_zone_id" {
  description = "Optional Route 53 hosted zone ID. When set together with domain_name, DNS validation records and the alias A/AAAA records are managed here."
  type        = string
  default     = ""
}

variable "cloudfront_price_class" {
  description = "PriceClass_100 (NA+EU, cheapest), PriceClass_200 (+ Asia, ME, Africa), or PriceClass_All."
  type        = string
  default     = "PriceClass_100"

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.cloudfront_price_class)
    error_message = "cloudfront_price_class must be PriceClass_100, PriceClass_200 or PriceClass_All."
  }
}

variable "enable_access_logs" {
  description = "Create a log bucket and send CloudFront standard access logs to it. Adds a small ongoing storage cost."
  type        = bool
  default     = false
}

variable "log_retention_days" {
  description = "Days to keep CloudFront access logs before expiry. Only used when enable_access_logs is true."
  type        = number
  default     = 30
}

variable "github_repository" {
  description = <<-EOT
    GitHub repository allowed to assume the deploy role, as "owner/repo".
    Required for the OIDC role that GitHub Actions uses. Leave empty to skip
    creating the role (then the workflow needs long-lived access keys instead).
  EOT
  type        = string
  default     = ""

  validation {
    condition     = var.github_repository == "" || can(regex("^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$", var.github_repository))
    error_message = "github_repository must be in the form \"owner/repo\"."
  }
}

variable "github_deploy_branch" {
  description = "Branch whose workflow runs may assume the deploy role. The trust policy is scoped to this ref only."
  type        = string
  default     = "main"
}

variable "create_github_oidc_provider" {
  description = "Create the GitHub OIDC provider in this account. Set to false if it already exists (it is account-wide, and a second one is an error)."
  type        = bool
  default     = true
}

variable "tags" {
  description = "Extra tags merged into every resource."
  type        = map(string)
  default     = {}
}
