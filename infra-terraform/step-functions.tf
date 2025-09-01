resource "aws_iam_role" "sfn_exec" {
  name = "canvas-sync-sfn-exec"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "states.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "sfn_exec_policy" {
  role = aws_iam_role.sfn_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["lambda:InvokeFunction"]
      Resource = [
        aws_lambda_function.canvas_fetcher.arn,
        aws_lambda_function.canvas_upserter.arn,
        aws_lambda_function.db_watcher.arn
      ]
    }]
  })
}

resource "aws_sfn_state_machine" "canvas_sync" {
  name     = "canvas-sync"
  role_arn = aws_iam_role.sfn_exec.arn

  definition = jsonencode(
    yamldecode(
      templatefile("${path.module}/../step_function_definition.yaml", {
        canvas_fetcher_arn  = aws_lambda_function.canvas_fetcher.arn,
        canvas_upserter_arn = aws_lambda_function.canvas_upserter.arn,
        db_watcher_arn      = aws_lambda_function.db_watcher.arn
      })
    )
  )
}
