output "public_ip" {
  value       = aws_instance.app_vm.public_ip
  description = "Public IP of EC2 instance"
}
