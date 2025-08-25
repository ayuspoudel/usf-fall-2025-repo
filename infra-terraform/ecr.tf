resource "aws_ecr_repository" "db_watcher" {
  name                 = "db-watcher"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

output "db_watcher_repo_url" {
  description = "ECR repo URL for db-watcher lambda image"
  value       = aws_ecr_repository.db_watcher.repository_url
}
