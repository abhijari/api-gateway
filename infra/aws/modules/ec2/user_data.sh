#!/bin/bash
set -e

# Update system
apt-get update -y

# Install Docker
apt-get install -y \
  ca-certificates \
  curl \
  gnupg \
  lsb-release

curl -fsSL https://get.docker.com | sh

# Enable Docker
systemctl enable docker
systemctl start docker

# Allow ubuntu user to run docker
usermod -aG docker ubuntu

# Install Docker Compose v2
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.29.2/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Create app directory
mkdir -p /opt/api-gateway
chown ubuntu:ubuntu /opt/api-gateway

# Runtime loader for gateway
cat << 'EOF' > /usr/local/bin/load_gateway_env.sh
#!/bin/sh

PREFIX="/api-gateway/${ENV}"

export NODE_ENV=$(aws ssm get-parameter --name "$PREFIX/NODE_ENV" --query Parameter.Value --output text)
export RATE_LIMIT=$(aws ssm get-parameter --name "$PREFIX/RATE_LIMIT" --query Parameter.Value --output text)
export REDIS_HOST=$(aws ssm get-parameter --name "$PREFIX/REDIS_HOST" --query Parameter.Value --output text)
export REDIS_PORT=$(aws ssm get-parameter --name "$PREFIX/REDIS_PORT" --query Parameter.Value --output text)

export DATABASE_URL=$(aws secretsmanager get-secret-value --secret-id "$PREFIX/DATABASE_URL" --query SecretString --output text)
EOF

chmod +x /usr/local/bin/load_gateway_env.sh

# Runtime loader for dashboard
cat << 'EOF' > /usr/local/bin/load_dashboard_env.sh
#!/bin/sh

PREFIX="/api-gateway/${ENV}"

export NODE_ENV=$(aws ssm get-parameter --name "$PREFIX/NODE_ENV" --query Parameter.Value --output text)
export GATEWAY_API_URL=$(aws ssm get-parameter --name "$PREFIX/GATEWAY_API_URL" --query Parameter.Value --output text)
EOF

chmod +x /usr/local/bin/load_dashboard_env.sh