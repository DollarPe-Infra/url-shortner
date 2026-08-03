#!/bin/sh
# andromeda pre_deploy hook — runs ONCE as a one-off ECS task before the new code
# serves traffic (not once per replica). A non-zero exit aborts the deploy and the
# old code keeps serving. Runs with the same task-def secrets/env as the app (DB
# creds included) but with NO FireLens sidecar — output lands in CloudWatch and is
# echoed into the CD log. POSIX sh (the image is node:alpine).
set -e

echo "[pre-deploy] Running knex migrations (npm run migrate)..."
npm run migrate
echo "[pre-deploy] Migrations done."
