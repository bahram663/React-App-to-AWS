output "site_url" {
  description = "Public URL of the dashboard."
  value       = local.use_custom_domain ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.site.domain_name}"
}

output "s3_bucket" {
  description = "Origin bucket name. Set this as the S3_BUCKET repository variable in GitHub."
  value       = aws_s3_bucket.site.id
}

output "cloudfront_distribution_id" {
  description = "Distribution ID. Set this as the CLOUDFRONT_DISTRIBUTION_ID repository variable in GitHub."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "The distribution's default *.cloudfront.net domain."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "github_actions_role_arn" {
  description = "Role for GitHub Actions to assume. Set this as the AWS_ROLE_ARN repository variable in GitHub."
  value       = local.create_oidc_role ? aws_iam_role.github_deploy[0].arn : null
}

output "acm_validation_records" {
  description = "DNS records to create manually when a custom domain is used without route53_zone_id."
  value = local.use_custom_domain && !local.manage_dns ? [
    for dvo in aws_acm_certificate.site[0].domain_validation_options : {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  ] : []
}

# Everything CI needs, in one copy-pasteable block.
output "github_repository_variables" {
  description = "Copy these into GitHub → Settings → Secrets and variables → Actions → Variables."
  value = {
    AWS_REGION                 = var.aws_region
    AWS_ROLE_ARN               = local.create_oidc_role ? aws_iam_role.github_deploy[0].arn : "<set github_repository to generate>"
    S3_BUCKET                  = aws_s3_bucket.site.id
    CLOUDFRONT_DISTRIBUTION_ID = aws_cloudfront_distribution.site.id
    SITE_URL                   = local.use_custom_domain ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.site.domain_name}"
  }
}
