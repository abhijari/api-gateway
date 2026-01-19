#!/bin/sh
set -e

echo "Loading dashboard runtime env from SSM for env: $ENV"

/usr/local/bin/load_dashboard_env.sh

exec "$@"