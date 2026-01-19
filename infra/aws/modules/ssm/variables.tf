variable "env" {
  type = string
}

variable "gateway_config" {
  type = map(string)
}

variable "gateway_secrets" {
  type      = map(string)
  sensitive = true
}

variable "dashboard_config" {
  type = map(string)
}

variable "dashboard_secrets" {
  type      = map(string)
  sensitive = true
}
