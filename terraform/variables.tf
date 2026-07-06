variable "project_name" {
  description = "Name used to prefix/tag resources"
  type        = string
  default     = "todo-app"
}

variable "environment" {
  description = "Deployment environment"
  type        = string

  validation {
    condition     = contains(["staging", "prod"], var.environment)
    error_message = "environment must be either \"staging\" or \"prod\"."
  }
}

variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.0.0/24", "10.0.1.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "availability_zones" {
  description = "AZs to spread subnets across"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "container_port" {
  description = "Port the todo-app container listens on"
  type        = number
  default     = 3000
}

variable "image_tag" {
  description = "Docker image tag to deploy (e.g. a git SHA pushed to ECR)"
  type        = string
  default     = "latest"
}

variable "task_cpu" {
  description = "Fargate task CPU units"
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Fargate task memory (MiB)"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Number of ECS tasks to run"
  type        = number
  default     = 1
}

variable "health_check_path" {
  description = "ALB target group health check path"
  type        = string
  default     = "/todos"
}
