#!/usr/bin/env bash
set -euo pipefail

# KOR React deploy script
# - Builds CRA app in kor-react/
# - Deploys to /var/www/jmrcycling.com on the remote server
# - Preserves and updates oauth/authorize/index.html (legacy page)
#
# Usage:
#   ./deploy-react.sh                 # default: root@jmrcycling.com, /var/www/jmrcycling.com
#   REMOTE_HOST=user@host ./deploy-react.sh
#   REMOTE_WEBROOT=/var/www/site ./deploy-react.sh
#
# Notes:
# - Prefers rsync (with delete) for a clean deploy. Falls back to sftp (no delete) if rsync is unavailable.
# - No secrets are echoed. SSH keys/agent should be configured.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$SCRIPT_DIR"
APP_DIR="$REPO_ROOT/kor-react"
LEGACY_OAUTH_DIR="$REPO_ROOT/oauth/authorize"

REMOTE_HOST="${REMOTE_HOST:-root@jmrcycling.com}"
REMOTE_WEBROOT="${REMOTE_WEBROOT:-/var/www/jmrcycling.com}"

BUILD_DIR="$APP_DIR/build"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

log() { printf "\n[%s] %s\n" "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }
err() { printf "\n[ERROR] %s\n" "$*" 1>&2; }

# 1) Build the React app
log "Building React app in $APP_DIR ..."
if [[ ! -d "$APP_DIR" ]]; then
  err "React app directory not found: $APP_DIR"
  exit 1
fi

pushd "$APP_DIR" >/dev/null
# Install deps if node_modules is missing or CI parity is desired
if [[ ! -d node_modules ]]; then
  log "Installing dependencies (npm ci) ..."
  npm ci
fi

log "Running build (npm run build) ..."
npm run build
popd >/dev/null

if [[ ! -d "$BUILD_DIR" ]]; then
  err "Build directory not found: $BUILD_DIR"
  exit 1
fi

# 2) Ensure legacy oauth file exists locally
if [[ ! -f "$LEGACY_OAUTH_DIR/index.html" ]]; then
  err "Missing legacy oauth file: $LEGACY_OAUTH_DIR/index.html"
  err "Please ensure oauth/authorize/index.html exists as requested."
  exit 1
fi

# 3) Deploy
log "Deploying to $REMOTE_HOST:$REMOTE_WEBROOT ..."

# Create remote webroot if needed
ssh -o StrictHostKeyChecking=no "$REMOTE_HOST" "mkdir -p '$REMOTE_WEBROOT' '$REMOTE_WEBROOT/oauth/authorize'" || {
  err "SSH failed while preparing remote directories."; exit 1; }

# Try rsync first for clean deploy with deletion (excluding oauth/)
if command -v rsync >/dev/null 2>&1; then
  log "Using rsync for deployment (with delete, excluding oauth/) ..."

  # Optional: remote backup
  BACKUP_PATH="$REMOTE_WEBROOT/backup-$TIMESTAMP.tgz"
  log "Creating remote backup at $BACKUP_PATH ..."
  ssh -o StrictHostKeyChecking=no "$REMOTE_HOST" "tar -C '$REMOTE_WEBROOT' -czf '$BACKUP_PATH' . || true"

  # Sync build to webroot, preserving oauth/
  rsync -az --delete --exclude 'oauth/' \
    -e "ssh -o StrictHostKeyChecking=no" \
    "$BUILD_DIR/" "$REMOTE_HOST:$REMOTE_WEBROOT/" || {
      err "rsync failed while syncing build/"; exit 1; }

  # Now sync the legacy oauth directory explicitly
  rsync -az \
    -e "ssh -o StrictHostKeyChecking=no" \
    "$LEGACY_OAUTH_DIR/" "$REMOTE_HOST:$REMOTE_WEBROOT/oauth/authorize/" || {
      err "rsync failed while syncing oauth/authorize/"; exit 1; }

  log "Deployment via rsync complete."
else
  log "rsync not available; falling back to sftp (no delete)."

  # Upload build directory recursively (without deleting stale files)
  log "Uploading build/ via sftp ..."
  sftp -o StrictHostKeyChecking=no "$REMOTE_HOST" <<EOF
cd "$REMOTE_WEBROOT"
put -r "$BUILD_DIR"/*
quit
EOF

  # Upload legacy oauth directory
  log "Uploading oauth/authorize via sftp ..."
  sftp -o StrictHostKeyChecking=no "$REMOTE_HOST" <<EOF
cd "$REMOTE_WEBROOT/oauth/authorize"
put -r "$LEGACY_OAUTH_DIR"/*
quit
EOF

  log "Deployment via sftp complete (note: stale files may remain)."
fi

log "Done. Verify at: https://jmrcycling.com/"
log "Legacy OAuth page: https://jmrcycling.com/oauth/authorize/"

echo ""
echo "Next steps:"
echo " - Ensure nginx serves this as an SPA (try_files \$uri /index.html)."
echo " - Add 301 rewrites from legacy .html pages to React routes (optional)."
echo " - Consider cache headers for static assets in nginx for performance."

