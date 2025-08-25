locals {
    aws_region = "us-east-1"
    lambda_function_name = "usf-fall-2025-canvas-sync"
    lambda_handler = "index.handler"
    lambda_runtime = "nodejs18.x"
    lambda_timeout = 30

}