# variables.tf
variable "mongo_uri" {}
variable "token_github" {}
variable "gh_project_id" {}
variable "gh_repo_owner" {}
variable "gh_repo_name" {}
variable "gh_field_course" {}
variable "gh_field_due_date" {}
variable "gh_field_type" {}
variable "gh_option_assignment" {}
variable "gh_option_exam" {}
variable "gh_option_project" {}
variable "gh_option_quiz" {}

variable "lambda_fetcher_image_uri" {
  description = "ECR image URI for canvas-fetcher Lambda"
  type        = string
}

variable "lambda_upserter_image_uri" {
  description = "ECR image URI for canvas-upserter Lambda"
  type        = string
}

variable "lambda_watcher_image_uri" {
  description = "ECR image URI for db-watcher Lambda"
  type        = string
}

