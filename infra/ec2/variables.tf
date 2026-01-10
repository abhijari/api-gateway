variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "env" {
  description = "Environment name (dev/prod)"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}

variable "ami_id" {
  description = "Ubuntu AMI ID"
  type        = string
}

variable "key_name" {
  description = "Existing AWS key pair name"
  type        = string
}
