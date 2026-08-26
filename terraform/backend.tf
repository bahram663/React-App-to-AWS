// Remote state.
//
// The stack works out of the box with local state, which is fine for a single
// operator. As soon as CI runs `terraform apply`, move state to S3 so runs
// share one source of truth and lock against each other.
//
// Bootstrap once (the bucket/table cannot be created by the config that stores
// its own state in them):
//
//   aws s3api create-bucket --bucket my-tfstate-bucket --region eu-central-1 \
//     --create-bucket-configuration LocationConstraint=eu-central-1
//   aws s3api put-bucket-versioning --bucket my-tfstate-bucket \
//     --versioning-configuration Status=Enabled
//   aws dynamodb create-table --table-name my-tf-locks \
//     --attribute-definitions AttributeName=LockID,AttributeType=S \
//     --key-schema AttributeName=LockID,KeyType=HASH \
//     --billing-mode PAY_PER_REQUEST
//
// Then uncomment the block below and run `terraform init -migrate-state`.
//
// terraform {
//   backend "s3" {
//     bucket         = "my-tfstate-bucket"
//     key            = "react-app-to-aws/terraform.tfstate"
//     region         = "eu-central-1"
//     dynamodb_table = "my-tf-locks"
//     encrypt        = true
//   }
// }
