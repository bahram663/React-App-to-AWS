# Atlas Dashboard — React on AWS S3 + CloudFront

A three-page React portfolio dashboard, the Terraform that puts it on AWS, and
the GitHub Actions pipeline that redeploys it on every push to `main`.

- **App** — Vite + React 18 + React Router. Three routes, four chart types, light/dark theme. No backend.
- **Infrastructure** — private S3 bucket, CloudFront with Origin Access Control, optional ACM certificate, an IAM role for CI. All in [terraform/](terraform/).
- **CI/CD** — build on pull requests, build + upload + invalidate on push to `main`. Keyless auth via GitHub OIDC. All in [.github/workflows/](.github/workflows/).

```
Browser ──HTTPS──▶ CloudFront ──OAC/SigV4──▶ S3 (private)
                        ▲
                        │ create-invalidation
                  GitHub Actions ──OIDC──▶ IAM role (no stored keys)
```

---

## Table of contents

1. [What's in the repo](#whats-in-the-repo)
2. [Run it locally](#run-it-locally)
3. [Deploy the infrastructure](#deploy-the-infrastructure)
4. [Wire up CI/CD](#wire-up-cicd)
5. [How the pipeline works](#how-the-pipeline-works)
6. [Design notes](#design-notes)
7. [Cost](#cost)
8. [Tearing it down](#tearing-it-down)
9. [Troubleshooting](#troubleshooting)

---

## What's in the repo

```
.
├── src/
│   ├── components/          Layout, StatTile, TrendChart, AllocationBar, DivergingBar, icons
│   ├── pages/               Overview, Holdings, Settings
│   ├── data/metrics.js      Static sample data
│   └── index.css            Design tokens + layout
├── terraform/
│   ├── main.tf              Locals, account lookup, naming
│   ├── s3.tf                Origin bucket + optional log bucket
│   ├── cloudfront.tf        OAC, distribution, cache & security headers
│   ├── acm.tf               Optional certificate + Route 53 records
│   ├── github_oidc.tf       OIDC provider + least-privilege deploy role
│   ├── variables.tf         Inputs
│   ├── outputs.tf           Bucket, distribution ID, role ARN, site URL
│   ├── providers.tf         Default region + us-east-1 alias for ACM
│   ├── backend.tf           Remote-state instructions (commented)
│   └── terraform.tfvars.example
└── .github/workflows/
    ├── ci.yml               PR: lint + build (no upload)
    ├── deploy.yml           push to main: build → S3 → invalidate
    └── terraform.yml        PR: plan · manual: apply
```

**Pages**

| Route | What it shows |
|---|---|
| `/` — Overview | Hero figure, four KPI tiles with gradient sparklines, a portfolio-vs-benchmark trend chart (indexed to 100) with a crosshair tooltip, recent activity |
| `/holdings` | Asset allocation (stacked bar with a table view), portfolio summary, today's movers (diverging bar chart), full holdings table |
| `/settings` | Dashboard preferences, notification toggles, and the commit/ref/timestamp baked into the running bundle |

---

## Run it locally

Requires Node 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # → dist/
npm run preview    # serve dist/ locally
npm run lint
```

---

## Deploy the infrastructure

### Prerequisites

- An AWS account, and the AWS CLI configured (`aws configure` or `aws sso login`).
- Terraform ≥ 1.5.
- Permission to create S3 buckets, CloudFront distributions, IAM roles, and (if you use a custom domain) ACM certificates.

Verify you are pointed at the right account before applying:

```bash
aws sts get-caller-identity
```

### 1. Configure

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`. The one value you must set for CI to work is
`github_repository`:

```hcl
project_name      = "atlas-dashboard"
environment       = "prod"
aws_region        = "eu-central-1"
github_repository = "your-user/react-app-to-aws"
```

Everything else has a working default. The bucket name is derived as
`<project>-<environment>-<account-id>`, so it is globally unique without you
picking one.

> **Already have a GitHub OIDC provider in this account?** It is account-wide
> and a second one is an error. Set `create_github_oidc_provider = false`.

### 2. Apply

```bash
terraform init
terraform plan
terraform apply
```

The CloudFront distribution takes roughly 3–8 minutes to reach `Deployed`.

### 3. Read the outputs

```bash
terraform output
```

```
site_url                   = "https://d1234abcd5678.cloudfront.net"
s3_bucket                  = "atlas-dashboard-prod-123456789012"
cloudfront_distribution_id = "E2QW8XMPLE1234"
github_actions_role_arn    = "arn:aws:iam::123456789012:role/atlas-dashboard-prod-github-deploy"
```

At this point the infrastructure exists but the bucket is empty — CloudFront
will return an error until the first deploy. Either push to `main` and let CI
fill it, or seed it by hand:

```bash
npm run build
aws s3 sync dist/ "s3://$(terraform -chdir=terraform output -raw s3_bucket)/" --delete
aws cloudfront create-invalidation \
  --distribution-id "$(terraform -chdir=terraform output -raw cloudfront_distribution_id)" \
  --paths "/*"
```

### Optional: custom domain

Set `domain_name`, and `route53_zone_id` if the zone is in the same account:

```hcl
domain_name     = "dashboard.example.com"
route53_zone_id = "Z0123456789ABCDEFGHIJ"
```

Terraform requests a DNS-validated ACM certificate in **us-east-1** (CloudFront
accepts certificates from nowhere else), adds the validation records, attaches
the alias, and points A/AAAA records at the distribution.

Without a `route53_zone_id`, the apply pauses at certificate validation. Run
`terraform output acm_validation_records` in another shell, create those records
at your DNS host, and the apply continues on its own.

---

## Wire up CI/CD

The deploy workflow reads five **repository variables** (not secrets — none of
these are sensitive, and variables are visible in logs, which makes debugging
easier).

Go to **Settings → Secrets and variables → Actions → Variables → New repository
variable** and add:

| Variable | Value | Where it comes from |
|---|---|---|
| `AWS_REGION` | `eu-central-1` | your `aws_region` |
| `AWS_ROLE_ARN` | `arn:aws:iam::…:role/atlas-dashboard-prod-github-deploy` | `terraform output github_actions_role_arn` |
| `S3_BUCKET` | `atlas-dashboard-prod-123456789012` | `terraform output s3_bucket` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `E2QW8XMPLE1234` | `terraform output cloudfront_distribution_id` |
| `SITE_URL` | `https://d1234abcd5678.cloudfront.net` | `terraform output site_url` — used only for the job summary link, not for the deploy itself |

Or copy all five at once:

```bash
terraform -chdir=terraform output github_repository_variables
```

With the `gh` CLI:

```bash
cd terraform
terraform output -json github_repository_variables \
  | jq -r 'to_entries[] | "\(.key)=\(.value)"' \
  | while IFS='=' read -r k v; do gh variable set "$k" -b "$v"; done
```

Then push:

```bash
git push origin main
```

**No AWS access keys are stored anywhere.** The workflow requests a short-lived
OIDC token from GitHub, and the IAM role's trust policy exchanges it for
temporary credentials — but only for this repository and only for the `main`
branch. The trust policy checks the token's `repository` and `ref` claims
directly (`bahram663/React-App-to-AWS` and `refs/heads/main`), rather than
parsing them out of the `sub` claim — GitHub embeds immutable owner/repo IDs
into `sub` for any account or repo that has ever been renamed
(`repo:owner@123/name@456:ref:...`), which breaks a plain `owner/repo` match
on `sub`. AWS still requires a `sub` (or `job_workflow_ref`) condition to be
present on any GitHub OIDC trust policy, so [github_oidc.tf](terraform/github_oidc.tf)
keeps a wildcarded one there purely to satisfy that requirement — the
`repository`/`ref` conditions are the actual access boundary, since every
condition in the statement must match.

A fork, a different branch, or another repository entirely cannot assume it.

---

## How the pipeline works

### `deploy.yml` — push to `main`

Triggered by a push to `main` (Markdown and `terraform/**` changes are ignored,
since they cannot change the bundle) or manually via **Actions → Deploy to AWS →
Run workflow**.

**Job 1 — build**

1. Check out the repo.
2. `actions/setup-node@v4` with `cache: npm`, restoring the npm cache keyed on `package-lock.json`.
3. `npm ci` — the lockfile exactly, never a drifting resolve.
4. `npm run build` — Vite emits `dist/` with content-hashed filenames, and bakes the commit SHA and build time into the bundle (visible on the Settings page).
5. Upload `dist/` as an artifact.

**Job 2 — deploy** (only if the build passed)

6. Download the artifact.
7. `aws-actions/configure-aws-credentials@v4` assumes `AWS_ROLE_ARN` via OIDC.
8. **Upload hashed assets** — `aws s3 sync dist/ … --include "assets/*"` with `Cache-Control: public,max-age=31536000,immutable`.
9. **Upload everything else** — `index.html` and friends with `Cache-Control: public,max-age=0,must-revalidate`.
10. **Invalidate** `/*` and wait for the invalidation to complete, so the run is green only once the new version is actually live.
11. Write a summary with the URL, commit, bucket, and invalidation ID.

**Why two upload passes?** The two file classes need opposite caching. Vite gives
every asset a content hash, so `index-BBzz6Hqz.js` can never change meaning — a
one-year immutable cache is free performance. `index.html` is the opposite: it is
the pointer to whichever hashed bundle is current, so if a browser caches it,
users keep loading yesterday's app after a deploy. Assets go up *first*, so the
new bundle is already in place by the time the HTML that references it appears.

`--delete` removes files that are gone from the build, and it is scoped by the
same filters, so each pass only prunes within its own class.

Concurrency is capped at one deploy at a time (`concurrency: deploy-production`,
`cancel-in-progress: false`) — a mid-upload run is never killed halfway.

### `ci.yml` — pull requests

Lint and build, no AWS credentials, nothing uploaded. This is the gate that
stops a broken bundle from ever reaching `deploy.yml`.

### `terraform.yml` — infrastructure changes

`plan` on any PR touching `terraform/**`, posted as a PR comment. `apply` only
via manual dispatch, behind a `production-infra` GitHub environment you can
require reviewers on. Nothing applies automatically on a push — an accidental
infra apply is far more expensive than an accidental redeploy.

This workflow is **optional**. If you use it, note it needs a *separate*,
broader role (`TF_ROLE_ARN`) than the deploy role, because it creates buckets,
distributions and IAM roles. The deploy role deliberately cannot do any of that.
Also uncomment the S3 backend in [terraform/backend.tf](terraform/backend.tf)
first — running `apply` in CI against local state will not work.

---

## Design notes

**The bucket is private.** No public ACL, no S3 website endpoint, no bucket-level
public read. CloudFront authenticates to S3 with SigV4 through Origin Access
Control, and the bucket policy grants `s3:GetObject` only to the CloudFront
service principal *and* only when `AWS:SourceArn` matches this distribution — so
nobody else's distribution can point at it. A second statement denies everything
over plain HTTP.

**Client-side routing.** `/holdings` is not an object in S3, so a hard refresh
makes S3 answer `403 AccessDenied` (403 rather than 404, precisely because the
bucket is private). Both 403 and 404 are rewritten to `/index.html` with a `200`,
and React Router resolves the path. `error_caching_min_ttl = 0` keeps CloudFront
from caching that rewrite for a genuinely missing asset.

**Least privilege in CI.** The deploy role can write objects to one bucket and
invalidate one distribution. It cannot create infrastructure, read other
buckets, or touch IAM.

**Bucket hygiene.** Versioning is on, and non-current versions expire after 30
days so replaced asset hashes do not accumulate forever. Incomplete multipart
uploads are aborted after 7 days.

**Security headers** are attached with a CloudFront response headers policy:
HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`, a referrer policy, and
a CSP. The app loads no third-party scripts, styles, fonts, or images, so the CSP
is a strict `'self'` (with `'unsafe-inline'` for styles only, which React needs
for inline `style` attributes).

**Charts** are hand-written inline SVG (plus one plain-HTML stacked bar) — no
charting dependency, which keeps the bundle at ~62 kB gzipped. Every chart
carries a hover tooltip. The trend chart indexes the portfolio and its
benchmark to a shared base of 100, since a dollar value and an index level
aren't the same unit — one shared y-axis, never a dual axis — with direct
endpoint labels alongside the legend. The allocation bar and holdings table
both offer a table view, so no value is reachable only through colour, and the
diverging "today's movers" bar pairs its gain/loss colour with an ▲/▼ marker
and a text label rather than colour alone. Series colours are a CVD-validated
palette, with separately chosen steps for dark mode rather than an inverted flip.

---

## Cost

For a low-traffic dashboard this sits inside or near the AWS free tier.

| Item | Rough cost |
|---|---|
| S3 storage (a few MB) | < $0.01/month |
| CloudFront (first 1 TB/month) | free tier, then ~$0.085/GB |
| CloudFront requests | free tier covers 10M/month |
| Invalidations | first 1,000 paths/month free; one `/*` counts as one path |
| ACM certificate | free |
| Route 53 hosted zone (if used) | $0.50/month |

The biggest avoidable cost is invalidating on every deploy at high frequency —
at 1,000+ deploys a month, invalidate only `/index.html` instead of `/*`, since
the hashed assets never need it.

---

## Tearing it down

```bash
# The bucket must be empty first — versioning means "empty" includes old versions.
aws s3 rm "s3://$(terraform -chdir=terraform output -raw s3_bucket)" --recursive
cd terraform && terraform destroy
```

Deleting a CloudFront distribution takes several minutes: Terraform disables it,
waits for the change to propagate, then deletes.

If `terraform destroy` fails on a non-empty versioned bucket, purge the old
versions:

```bash
BUCKET=$(terraform -chdir=terraform output -raw s3_bucket)
aws s3api delete-objects --bucket "$BUCKET" --delete "$(aws s3api list-object-versions \
  --bucket "$BUCKET" --output json \
  --query '{Objects: Versions[].{Key:Key,VersionId:VersionId}}')"
```

---

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `Error: creating IAM OIDC Provider: EntityAlreadyExists` | The account already has the GitHub provider. Set `create_github_oidc_provider = false`. |
| `Not authorized to perform sts:AssumeRoleWithWebIdentity` | The trust policy's `repository`/`ref` conditions don't match. Check `github_repository` is exactly `owner/repo`, that you pushed to `github_deploy_branch`, and that the deploy job doesn't target a GitHub `environment:` (that changes the token's `sub` claim and is unrelated to `repository`/`ref`, but worth ruling out if you've customized the workflow). |
| `Credentials could not be loaded` in Actions | `permissions: id-token: write` is missing, or `AWS_ROLE_ARN` is unset. It is a repository **variable**, not a secret. |
| `AccessDenied` at the CloudFront URL | The bucket is empty, or the first deploy has not run. Seed it with the `aws s3 sync` above. |
| Deploy succeeded but the site is unchanged | The invalidation has not finished, or a proxy cached `index.html`. Hard-refresh; check the invalidation ID in the job summary. |
| A route 404s on refresh | The `custom_error_response` blocks in `cloudfront.tf` are missing or the distribution has not finished deploying. |
| `terraform apply` hangs on `aws_acm_certificate_validation` | DNS validation records are not resolving. With no `route53_zone_id`, create them by hand from `terraform output acm_validation_records`. |
| `BucketAlreadyExists` | Extremely unlikely (the name includes your account ID), but change `project_name` if it happens. |
