data "aws_caller_identity" "current" {}

locals {
  name = "${var.project_name}-${var.environment}"

  # S3 bucket names are globally unique, so the account ID keeps this stack
  # applyable in any account without hand-picking a name.
  bucket_name = "${local.name}-${data.aws_caller_identity.current.account_id}"

  use_custom_domain = var.domain_name != ""
  manage_dns        = local.use_custom_domain && var.route53_zone_id != ""
  create_oidc_role  = var.github_repository != ""

  tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    },
    var.tags,
  )
}
