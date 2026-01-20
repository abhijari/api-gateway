#!/bin/sh
set -e

echo "Loading runtime config from SSM for env: $ENV"

/usr/local/bin/load_dashboard_env.sh

exec "$@"