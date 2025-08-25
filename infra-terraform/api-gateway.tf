# HTTP API Gateway (cheaper & simpler than REST API Gateway)
resource "aws_apigatewayv2_api" "db_watcher_api" {
  name          = "db-watcher-api"
  protocol_type = "HTTP"
}

# Integration: connect API Gateway → Lambda
resource "aws_apigatewayv2_integration" "db_watcher_integration" {
  api_id           = aws_apigatewayv2_api.db_watcher_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.db_watcher.invoke_arn
  integration_method = "POST"
}

# Route: POST /watch
resource "aws_apigatewayv2_route" "db_watcher_route" {
  api_id    = aws_apigatewayv2_api.db_watcher_api.id
  route_key = "POST /watch"
  target    = "integrations/${aws_apigatewayv2_integration.db_watcher_integration.id}"
}

# Stage: prod
resource "aws_apigatewayv2_stage" "db_watcher_stage" {
  api_id      = aws_apigatewayv2_api.db_watcher_api.id
  name        = "prod"
  auto_deploy = true
}

# Permission: allow API Gateway to invoke Lambda
resource "aws_lambda_permission" "apigw_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.db_watcher.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.db_watcher_api.execution_arn}/*/*"
}

output "db_watcher_api_url" {
  value = "${aws_apigatewayv2_stage.db_watcher_stage.invoke_url}/watch"
}
