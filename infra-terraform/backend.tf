terraform {
  required_version = ">= 1.5.0"
  backend "s3" {
    bucket = local.state_bucket
    key    = "usf-fall-2025/lambda/terraform.tfstate"
    region = local.aws_region
    dynamodb_table = local.dynamodb_table
  }
}

provider "aws" {
  region = local.aws_region
}
