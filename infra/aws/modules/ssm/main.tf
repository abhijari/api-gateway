resource "aws_ssm_parameter" "gateway" {
  for_each = var.gateway_config

  name  = "/api-gateway/${var.env}/${each.key}"
  type  = "String"
  value = each.value
}

resource "aws_ssm_parameter" "dashboard" {
  for_each = var.dashboard_config

  name  = "/dashboard/${var.env}/${each.key}"
  type  = "String"
  value = each.value
}

locals {
  gateway_secret_keys = toset(nonsensitive(keys(var.gateway_secrets)))
}

resource "aws_secretsmanager_secret" "gateway" {
  for_each = local.gateway_secret_keys
  name     = "/api-gateway/${var.env}/${each.value}"
}

resource "aws_secretsmanager_secret_version" "gateway" {
  for_each = local.gateway_secret_keys

  secret_id     = aws_secretsmanager_secret.gateway[each.value].id
  secret_string = var.gateway_secrets[each.value]
}