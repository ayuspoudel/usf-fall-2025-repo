resource "aws_lambda_function" "db_watcher" {
  function_name = "db-watcher"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "db_watcher.handler"
  runtime       = "nodejs20.x"

  filename         = "${path.module}/../dist/db_watcher.zip"
  source_code_hash = filebase64sha256("${path.module}/../dist/db_watcher.zip")

  environment {
    variables = {
      MONGO_URI          = var.mongo_uri
      TOKEN_GITHUB       = var.gh_token
      GH_PROJECT_ID      = var.gh_project_id
      GH_REPO_ID         = var.gh_repo_id
      GH_FIELD_COURSE    = var.gh_field_course
      GH_FIELD_DUE_DATE  = var.gh_field_due_date
      GH_FIELD_TYPE      = var.gh_field_type
      GH_OPTION_QUIZ     = var.gh_option_quiz
      GH_OPTION_ASSIGNMENT = var.gh_option_assignment
      GH_OPTION_EXAM     = var.gh_option_exam
      GH_OPTION_PROJECT  = var.gh_option_project
    }
  }
}
