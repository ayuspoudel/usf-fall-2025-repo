variable "mongo_uri" {
  description = "MongoDB connection string"
  type        = string
}

variable "gh_token" {
  description = "GitHub API token"
  type        = string
}

variable "gh_project_id" {
  description = "GitHub Project V2 node ID"
  type        = string
}

variable "gh_repo_id" {
  description = "GitHub repository node ID"
  type        = string
}

variable "gh_field_course" {
  description = "GitHub Project field ID for Course"
  type        = string
}

variable "gh_field_due_date" {
  description = "GitHub Project field ID for Due Date"
  type        = string
}

variable "gh_field_type" {
  description = "GitHub Project field ID for Type"
  type        = string
}

variable "gh_option_quiz" {
  description = "GitHub Project option ID for Quiz"
  type        = string
}

variable "gh_option_assignment" {
  description = "GitHub Project option ID for Assignment"
  type        = string
}

variable "gh_option_exam" {
  description = "GitHub Project option ID for Exam"
  type        = string
}

variable "gh_option_project" {
  description = "GitHub Project option ID for Project"
  type        = string
}
