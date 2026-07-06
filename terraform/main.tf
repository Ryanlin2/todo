locals {
  name = "${var.project_name}-${var.environment}"
}

module "networking" {
  source = "./modules/networking"

  name                 = local.name
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
  container_port       = var.container_port
}

module "ecr" {
  source = "./modules/ecr"

  name = local.name
}

module "iam" {
  source = "./modules/iam"

  name = local.name
}

module "ecs" {
  source = "./modules/ecs"

  name                   = local.name
  vpc_id                 = module.networking.vpc_id
  public_subnet_ids      = module.networking.public_subnet_ids
  private_subnet_ids     = module.networking.private_subnet_ids
  alb_security_group_id  = module.networking.alb_security_group_id
  ecs_security_group_id  = module.networking.ecs_security_group_id

  ecr_repository_url = module.ecr.repository_url
  image_tag           = var.image_tag

  execution_role_arn = module.iam.execution_role_arn
  task_role_arn      = module.iam.task_role_arn
  log_group_name     = module.iam.log_group_name

  container_port     = var.container_port
  task_cpu           = var.task_cpu
  task_memory        = var.task_memory
  desired_count      = var.desired_count
  health_check_path  = var.health_check_path
}
