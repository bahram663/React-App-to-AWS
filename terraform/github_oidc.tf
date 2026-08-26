# ---------------------------------------------------------------------------
# Keyless CI auth. GitHub Actions exchanges its short-lived OIDC token for
# temporary AWS credentials — no access keys are ever stored in the repo.
# ---------------------------------------------------------------------------

resource "aws_iam_openid_connect_provider" "github" {
  count = local.create_oidc_role && var.create_github_oidc_provider ? 1 : 0

  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]

  lifecycle {
    # IAM verifies the OIDC endpoint's certificate itself now; the thumbprint
    # is a legacy required field and rotates without meaning anything here.
    ignore_changes = [thumbprint_list]
  }
}

data "aws_iam_openid_connect_provider" "github_existing" {
  count = local.create_oidc_role && !var.create_github_oidc_provider ? 1 : 0
  url   = "https://token.actions.githubusercontent.com"
}

locals {
  github_oidc_arn = local.create_oidc_role ? (
    var.create_github_oidc_provider
    ? aws_iam_openid_connect_provider.github[0].arn
    : data.aws_iam_openid_connect_provider.github_existing[0].arn
  ) : null
}

data "aws_iam_policy_document" "github_assume_role" {
  count = local.create_oidc_role ? 1 : 0

  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [local.github_oidc_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Scoped to one repo and one branch. Without a `sub` condition any GitHub
    # repository on the internet could assume this role.
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repository}:ref:refs/heads/${var.github_deploy_branch}"]
    }
  }
}

resource "aws_iam_role" "github_deploy" {
  count = local.create_oidc_role ? 1 : 0

  name                 = "${local.name}-github-deploy"
  description          = "Assumed by GitHub Actions in ${var.github_repository} to publish the built site"
  assume_role_policy   = data.aws_iam_policy_document.github_assume_role[0].json
  max_session_duration = 3600
}

# Exactly what a deploy needs: write the built files, remove deleted ones,
# and invalidate this one distribution. Nothing else.
data "aws_iam_policy_document" "github_deploy" {
  count = local.create_oidc_role ? 1 : 0

  statement {
    sid    = "ListSiteBucket"
    effect = "Allow"
    actions = [
      "s3:ListBucket",
      "s3:GetBucketLocation",
    ]
    resources = [aws_s3_bucket.site.arn]
  }

  statement {
    sid    = "WriteSiteObjects"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = ["${aws_s3_bucket.site.arn}/*"]
  }

  statement {
    sid    = "InvalidateDistribution"
    effect = "Allow"
    actions = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetInvalidation",
    ]
    resources = [aws_cloudfront_distribution.site.arn]
  }
}

resource "aws_iam_role_policy" "github_deploy" {
  count = local.create_oidc_role ? 1 : 0

  name   = "${local.name}-deploy"
  role   = aws_iam_role.github_deploy[0].id
  policy = data.aws_iam_policy_document.github_deploy[0].json
}
