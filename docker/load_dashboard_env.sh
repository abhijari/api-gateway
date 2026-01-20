#!/bin/sh

PREFIX="/api-gateway/${ENV}"

export NODE_ENV=$(aws ssm get-parameter --name "$PREFIX/NODE_ENV" --query Parameter.Value --output text)
export GATEWAY_API_URL=$(aws ssm get-parameter --name "$PREFIX/GATEWAY_API_URL" --query Parameter.Value --output text)