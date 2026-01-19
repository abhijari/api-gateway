variable "env" {
  description = "Environment name (dev/prod)"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}

variable "key_name" {
  description = "Existing AWS key pair name"
  type        = string
  default     = "api-gateway-app"
}

variable "gateway_config" {
  type = map(string)
}

variable "gateway_secrets" {
  type = map(string)
  sensitive = true
}

variable "dashboard_config" {
  type = map(string)
}

variable "dashboard_secrets" {
  type      = map(string)
  sensitive = true
}