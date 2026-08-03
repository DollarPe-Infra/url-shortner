#!/bin/sh
# ECS (andromeda) app-container entrypoint — server only.
#
# knex migrations do NOT run here — they run once via the andromeda pre_deploy
# hook (pre-deploy.sh), never per-replica. startup.sh is left untouched for App
# Runner (apprunner.yaml -> sh startup.sh). Selected on ECS via
# service.yaml `command: sh ecs-start.sh`. POSIX sh (the image is node:alpine).
set -e

# Listen on the port andromeda's ALB target group health-checks
# (service.yaml expose.port = 3000).
export PORT="${PORT:-3000}"
echo "🚀 [ecs] Starting url-shortner (node) on 0.0.0.0:${PORT} ..."
exec npm start
