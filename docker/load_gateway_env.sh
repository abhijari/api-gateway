#!/bin/sh

PREFIX="/api-gateway/${ENV}"

export NODE_ENV=$(aws ssm get-parameter --name "$PREFIX/NODE_ENV" --query Parameter.Value --output text)
export RATE_LIMIT=$(aws ssm get-parameter --name "$PREFIX/RATE_LIMIT" --query Parameter.Value --output text)
export REDIS_HOST=$(aws ssm get-parameter --name "$PREFIX/REDIS_HOST" --query Parameter.Value --output text)
export REDIS_PORT=$(aws ssm get-parameter --name "$PREFIX/REDIS_PORT" --query Parameter.Value --output text)

export DATABASE_URL=$(aws secretsmanager get-secret-value --secret-id "$PREFIX/DATABASE_URL" --query SecretString --output text)