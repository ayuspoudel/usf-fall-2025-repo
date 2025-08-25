terraform {
  required_version = ">= 1.5.0"
  backend "s3" {
    bucket = "clodstco-terraform-state"
    key    = "usf-fall-2025/lambda/terraform.tfstate"
    region = "us-east-1"
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = "us-east-1"
}

