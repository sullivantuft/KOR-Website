#!/bin/bash

echo "🚀 Deploying KOR Website Changes to jmrcycling.com"
echo "=================================================="

# Check if we're in the right directory
if [[ ! -f "index.html" ]]; then
    echo "❌ Error: Please run this script from the KOR website directory"
    exit 1
fi

# Create deployment log
DEPLOY_LOG="deploy-$(date +%Y%m%d-%H%M%S).log"
echo "📋 Deployment log: $DEPLOY_LOG"

# Function to upload file via SFTP
upload_file() {
    local_file="$1"
    remote_path="$2"
    
    echo "📤 Uploading: $local_file → $remote_path"
    
    sftp -o StrictHostKeyChecking=no root@jmrcycling.com << EOF >> "$DEPLOY_LOG" 2>&1
cd /var/www/jmrcycling.com
put "$local_file" "$remote_path"
quit
EOF
    
    if [[ $? -eq 0 ]]; then
        echo "✅ Success: $local_file"
    else
        echo "❌ Failed: $local_file"
        return 1
    fi
}

# Start deployment
echo "🔧 Starting deployment..."
echo "Deployment started at $(date)" >> "$DEPLOY_LOG"

# Upload modified files
echo ""
echo "📁 Uploading modified files..."
upload_file "index.html" "index.html"
upload_file "app_auth.html" "app_auth.html"
upload_file "contact_us.html" "contact_us.html"
upload_file "personal_plans.html" "personal_plans.html"
upload_file "shop_tools/dashboard.html" "shop_tools/dashboard.html"
upload_file "shop_tools/personal_signin.html" "shop_tools/personal_signin.html"
upload_file "shop_tools/personal_signin_script.js" "shop_tools/personal_signin_script.js"
upload_file "shop_tools/signin.html" "shop_tools/signin.html"
upload_file "shop_tools/signin_script.js" "shop_tools/signin_script.js"
upload_file "styles/styles.css" "styles/styles.css"

# Upload new files
echo ""
echo "📁 Uploading new files..."
upload_file "qr-guide.html" "qr-guide.html"
upload_file "shop_tools/test_authorization.html" "shop_tools/test_authorization.html"
upload_file "shop_tools/test_personal_authorization.html" "shop_tools/test_personal_authorization.html"

# Verify deployment
echo ""
echo "🔍 Verifying deployment..."
echo "Testing main page..."
if curl -s "https://jmrcycling.com/" > /dev/null; then
    echo "✅ Main page accessible"
else
    echo "❌ Main page not accessible"
fi

echo "Testing QR guide page..."
if curl -s "https://jmrcycling.com/qr-guide.html" > /dev/null; then
    echo "✅ QR guide page accessible"
else
    echo "❌ QR guide page not accessible"
fi

echo "Testing dashboard..."
if curl -s "https://jmrcycling.com/shop_tools/dashboard.html" > /dev/null; then
    echo "✅ Dashboard accessible"
else
    echo "❌ Dashboard not accessible"
fi

echo "Testing signin page..."
if curl -s "https://jmrcycling.com/shop_tools/personal_signin.html" > /dev/null; then
    echo "✅ Signin page accessible"
else
    echo "❌ Signin page not accessible"
fi

echo ""
echo "🎉 Deployment completed!"
echo "📋 Check $DEPLOY_LOG for detailed logs"
echo ""
echo "🔗 Test your changes:"
echo "   Main site: https://jmrcycling.com/"
echo "   QR Guide:  https://jmrcycling.com/qr-guide.html"
echo "   Dashboard: https://jmrcycling.com/shop_tools/login.html"
echo ""
echo "⚠️  Remember to test QR codes after deployment!"
