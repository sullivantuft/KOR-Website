#!/bin/bash

# ==============================================================================
# Server Setup Script for GitHub Actions Deployment
# This script creates a dedicated 'github' user for automated deployments
# ==============================================================================

set -e  # Exit on any error

echo "🚀 Setting up deployment user for GitHub Actions..."

# ==============================================================================
# CONFIGURATION
# ==============================================================================

GITHUB_USER="github"
WEB_ROOT="/var/www/jmrcycling.com"
GITHUB_PUBLIC_KEY="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCkT6EI/rhqyA0dhYpBEtEBoeGi4hHSTxjLsglXI/jXYvDbWOJPNYAn9N8/0SHBZbBHE0HAVOQzNqyGvlJgAqAM49/533MlNT2pIqhE5tZdd2yStnJEfU+oQwg7GIdh8NniBybzxljYlvwnC7J69ndTpaKf1kc5ahHju56dPZSO4mgPspmPoWZtT21+Te9fK2MQMvHwT7PcjWcN2aap7HWOKAuhhhsZ/F+opVP0p8o+zzppnHY3Vo7nYdQgfwvL/8fYQdVn4rYjO1ZarD+wrmSYOIT6Kcb0Y/ND2DGv03JQ4K1oT1Iwc216V1iD9q7VRWaimHev2+iQc0nd70Fe5HrPIupx0WH95024hAcnlF3Y0D9N+1fXzaBP6Xg6/etSagtFoNB+F3dRC3g6JCvJ+jv7PnA1pl3jkK8fO7BdIMus3MKpaO3HgZOZcYM3AG/O55g99tXAJMNHtDS22ArDbCk3UUL2Fl9A/KR/fy8hulJKlIivdG8UsnV1VXjK6YfIl5T531sb7JvILSLkrhdVIW4ILJJwh8s1+k0ypUzyn2bd74ytnqJ700vbAF6FRCZPIKwwrK+fnxxQ2aPEDtVIJoTI7zSD1fxW8vOUbvD1nNv3RcK1T8vzIb9TzYijA8wqx3cGtnbE0AwMlwK/NnwTvrVgBZyqa0o8HTro3/u0mbPvgQ== github-actions@jmrcycling.com"

# ==============================================================================
# CHECK IF RUNNING AS ROOT
# ==============================================================================

if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)" 
   exit 1
fi

# ==============================================================================
# CREATE GITHUB USER
# ==============================================================================

echo "📝 Creating user '$GITHUB_USER'..."

# Create the user if it doesn't exist
if ! id "$GITHUB_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$GITHUB_USER"
    echo "✅ User '$GITHUB_USER' created successfully"
else
    echo "ℹ️  User '$GITHUB_USER' already exists"
fi

# ==============================================================================
# SETUP SSH ACCESS
# ==============================================================================

echo "🔑 Setting up SSH access for '$GITHUB_USER'..."

# Create .ssh directory
SSH_DIR="/home/$GITHUB_USER/.ssh"
mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"

# Add the public key to authorized_keys
echo "$GITHUB_PUBLIC_KEY" > "$SSH_DIR/authorized_keys"
chmod 600 "$SSH_DIR/authorized_keys"

# Set correct ownership
chown -R "$GITHUB_USER:$GITHUB_USER" "$SSH_DIR"

echo "✅ SSH access configured for '$GITHUB_USER'"

# ==============================================================================
# SETUP WEB DIRECTORY PERMISSIONS
# ==============================================================================

echo "📁 Setting up web directory permissions..."

# Create web directory if it doesn't exist
mkdir -p "$WEB_ROOT"

# Set ownership to allow github user to write
chown -R "$GITHUB_USER:www-data" "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"

# Ensure www-data can read the files
find "$WEB_ROOT" -type f -exec chmod 644 {} \;
find "$WEB_ROOT" -type d -exec chmod 755 {} \;

echo "✅ Web directory permissions configured"

# ==============================================================================
# SETUP SUDO PERMISSIONS (OPTIONAL)
# ==============================================================================

echo "🔐 Setting up limited sudo permissions..."

# Create sudoers file for github user (optional - for service restarts)
cat > "/etc/sudoers.d/$GITHUB_USER" <<EOF
# Allow github user to restart web services without password
$GITHUB_USER ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx
$GITHUB_USER ALL=(ALL) NOPASSWD: /bin/systemctl restart nginx
$GITHUB_USER ALL=(ALL) NOPASSWD: /bin/systemctl reload apache2
$GITHUB_USER ALL=(ALL) NOPASSWD: /bin/systemctl restart apache2
EOF

chmod 440 "/etc/sudoers.d/$GITHUB_USER"

echo "✅ Sudo permissions configured"

# ==============================================================================
# TEST SSH CONNECTION
# ==============================================================================

echo "🧪 Testing SSH configuration..."

# Display connection information
echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "✅ Setup complete! Here's what was configured:"
echo ""
echo "👤 User: $GITHUB_USER"
echo "🏠 Home: /home/$GITHUB_USER"
echo "🌐 Web Root: $WEB_ROOT"
echo "🔑 SSH Key: Added to /home/$GITHUB_USER/.ssh/authorized_keys"
echo ""
echo "📋 GitHub Secrets to configure:"
echo "   PROD_SSH_USER: $GITHUB_USER"
echo "   PROD_SERVER_HOST: $(hostname -f || hostname)"
echo "   PROD_SSH_PRIVATE_KEY: [Use the private key you generated earlier]"
echo ""
echo "🧪 Test the connection with:"
echo "   ssh -i ~/.ssh/github_actions_key $GITHUB_USER@$(hostname -f || hostname)"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

echo "🎉 Deployment user setup completed successfully!"
