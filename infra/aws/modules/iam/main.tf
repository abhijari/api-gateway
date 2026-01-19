resource "aws_iam_role" "ec2_role" {
  name = "${var.env}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_instance_profile" "profile" {
  name = "${var.env}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

resource "aws_iam_policy" "ssm_access" {
  name = "${var.env}-ssm-access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Resource = [
          "arn:aws:ssm:*:*:parameter/api-gateway/${var.env}/*",
          "arn:aws:ssm:*:*:parameter/dashboard/${var.env}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = "secretsmanager:GetSecretValue"
        Resource = [
          "arn:aws:secretsmanager:*:*:secret:/api-gateway/${var.env}/*",
          "arn:aws:secretsmanager:*:*:secret:/dashboard/${var.env}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.ssm_access.arn
}
