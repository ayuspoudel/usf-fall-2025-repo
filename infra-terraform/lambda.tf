# lambda.tf
resource "aws_lambda_function" "db_watcher" {
  function_name = "db-watcher"
  role          = aws_iam_role.lambda_exec.arn
  package_type  = "Image"
  image_uri     = var.lambda_image_uri
  timeout       = 900

  environment {
    variables = {
      MONGO_URI             = var.mongo_uri
      TOKEN_GITHUB          = var.token_github
      GH_PROJECT_ID         = var.gh_project_id
      GH_REPO_OWNER         = var.gh_repo_owner
      GH_REPO_NAME          = var.gh_repo_name
      GH_FIELD_COURSE       = var.gh_field_course
      GH_FIELD_DUE_DATE     = var.gh_field_due_date
      GH_FIELD_TYPE         = var.gh_field_type
      GH_OPTION_ASSIGNMENT  = var.gh_option_assignment
      GH_OPTION_EXAM        = var.gh_option_exam
      GH_OPTION_PROJECT     = var.gh_option_project
      GH_OPTION_QUIZ        = var.gh_option_quiz
    }
  }
}
