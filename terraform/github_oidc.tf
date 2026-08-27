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

  github_owner     = split("/", var.github_repository)[0]
  github_repo_name = split("/", var.github_repository)[1]
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

    # The real scoping: exact match on the `repository` and `ref` claims.
    # These stay as plain "owner/repo" and "refs/heads/branch" strings
    # regardless of whether the account or repo has ever been renamed.
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:repository"
      values   = [var.github_repository]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:ref"
      values   = ["refs/heads/${var.github_deploy_branch}"]
    }

    # AWS requires every GitHub OIDC trust policy to also condition on `sub`
    # (or `job_workflow_ref`) and rejects one that can't evaluate it. `sub`
    # embeds immutable owner/repo IDs for any account or repo that has ever
    # been renamed (e.g. `repo:owner@123/name@456:ref:...`), so it can't be
    # matched exactly without hardcoding those IDs. This wildcard exists only
    # to satisfy that requirement — the `repository`/`ref` conditions above
    # are the actual access boundary, and every condition in this statement
    # must match, so a loose `sub` here grants nothing on its own.
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${local.github_owner}*/${local.github_repo_name}*:ref:refs/heads/${var.github_deploy_branch}"]
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
