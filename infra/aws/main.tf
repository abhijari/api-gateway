provider "aws" {
  region = var.region
}

module "iam" {
  source = "./modules/iam"
  env    = var.env
}

module "ssm" {
  source = "./modules/ssm"

  env               = var.env
  gateway_config    = var.gateway_config
  gateway_secrets   = var.gateway_secrets
  dashboard_config  = var.dashboard_config
  dashboard_secrets = var.dashboard_secrets
}

module "ec2" {
  source = "./modules/ec2"

  env           = var.env
  instance_type = var.instance_type
  iam_role_name = module.iam.ec2_role_name
}
