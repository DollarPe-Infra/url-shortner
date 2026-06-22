#!/bin/bash
set -e

# Enable error output for debugging
trap 'echo "❌ Error on line $LINENO: $BASH_COMMAND"; exit 1' ERR

echo "========================================"
echo "🚀 URL Shortener Startup Script"
echo "========================================"
echo ""

# Log environment info
echo "📋 Environment Information:"
echo "  Node Version: $(node --version)"
echo "  NPM Version: $(npm --version)"
echo "  PORT: ${PORT:-3000}"
echo "  NODE_ENV: ${NODE_ENV:-production}"
echo "  Site: ${SITE_NAME:-Dollarpe}"
echo ""

# Check critical environment variables
echo "🔍 Validating environment variables..."
REQUIRED_VARS=("DB_HOST" "DB_NAME" "DB_USER" "DB_PASSWORD" "DB_PORT")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo "❌ Missing required environment variables:"
  printf '   - %s\n' "${MISSING_VARS[@]}"
  exit 1
fi
echo "✅ All required environment variables present"
echo ""

# Run database migrations
echo "🗄️  Running database migrations..."
if npm run migrate 2>&1; then
  echo "✅ Migrations completed successfully"
else
  echo "❌ Migration failed. Check database connectivity and credentials."
  exit 1
fi
echo ""

# Verify Node modules are present
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "⚠️  node_modules not found. Running npm ci..."
  npm ci --omit=dev
fi
echo "✅ Dependencies verified"
echo ""

# Display startup info
echo "========================================"
echo "🌟 Starting application..."
echo "========================================"
echo "Listen on: 0.0.0.0:${PORT:-3000}"
echo "Health check endpoint: http://0.0.0.0:${PORT:-3000}/health"
echo ""

# Start the application with proper error handling
# Using exec to replace shell process and capture app output
exec npm start
