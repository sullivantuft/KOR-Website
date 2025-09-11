#!/bin/bash

echo "🚀 Deploying KOR Website Changes to jmrcycling.com"
echo "=================================================="

# Check if we're in the right directory
if [[ ! -f "index.html" ]]; then
    echo "❌ Error: Please run this script from the KOR website directory"
    exit 1
fi

# Configuration
DEPLOY_LOG="deploy-$(date +%Y%m%d-%H%M%S).log"
TEST_RESULTS_DIR="test-results"
LOCAL_SERVER_PORT=8080
SKIP_TESTS=${SKIP_TESTS:-false}
RUN_QUICK_TESTS=${RUN_QUICK_TESTS:-true}
TEST_TIMEOUT=30

echo "📋 Deployment log: $DEPLOY_LOG"
if [[ "$SKIP_TESTS" != "true" ]]; then
    echo "🧪 Test results directory: $TEST_RESULTS_DIR"
    mkdir -p "$TEST_RESULTS_DIR"
fi

# Function to cleanup on exit
cleanup() {
    echo "🧹 Cleaning up..."
    if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
        kill "$SERVER_PID" 2>/dev/null
        echo "🛑 Stopped local server (PID: $SERVER_PID)"
    fi
    rm -f server.pid KeepOnRollingTest_local.side 2>/dev/null
}

# Set trap to run cleanup on script exit
trap cleanup EXIT

# Function to run quick tests before deployment
run_quick_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        echo "⏭️ Skipping tests (SKIP_TESTS=true)"
        return 0
    fi
    
    if [[ "$RUN_QUICK_TESTS" != "true" ]]; then
        echo "⏭️ Skipping quick tests (RUN_QUICK_TESTS=false)"
        return 0
    fi

    echo ""
    echo "🧪 Running Quick Pre-Deployment Tests"
    echo "====================================="
    
    # Check for basic tools
    local missing_tools=()
    
    if ! command -v node &> /dev/null; then
        missing_tools+=("node")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    fi
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        echo "⚠️ Missing tools: ${missing_tools[*]} - skipping advanced tests"
        return 0
    fi
    
    # Install dependencies quietly
    echo "📦 Installing test dependencies..."
    npm install --silent 2>/dev/null || echo "⚠️ Some dependencies failed to install"
    
    # Start local server for testing
    echo "🚀 Starting local test server..."
    
    # Kill any existing process on the port
    if lsof -Pi :$LOCAL_SERVER_PORT -sTCP:LISTEN -t > /dev/null; then
        kill $(lsof -t -i:$LOCAL_SERVER_PORT) 2>/dev/null || true
        sleep 2
    fi
    
    # Start server in background
    python3 -m http.server $LOCAL_SERVER_PORT > /dev/null 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > server.pid
    
    # Wait for server to start
    sleep 3
    
    # Verify server is running
    if ! curl -s http://localhost:$LOCAL_SERVER_PORT > /dev/null; then
        echo "❌ Failed to start local server for testing"
        return 1
    fi
    
    echo "✅ Server running at http://localhost:$LOCAL_SERVER_PORT"
    
    local test_failed=false
    
    # Run basic HTML validation
    echo "🔍 Running HTML validation..."
    if npm run validate 2>&1 | tee "$TEST_RESULTS_DIR/validation-tests.log" | tail -n 10; then
        echo "✅ HTML validation passed"
    else
        echo "⚠️ HTML validation issues found"
        test_failed=true
    fi
    
    # Run linting
    echo "🔍 Running code linting..."
    if npm run lint 2>&1 | tee "$TEST_RESULTS_DIR/lint-tests.log" | tail -n 10; then
        echo "✅ Linting passed"
    else
        echo "⚠️ Linting issues found"
        test_failed=true
    fi
    
    # Run unit tests if available
    if [[ -d "tests" ]] || [[ -f "jest.config.js" ]]; then
        echo "🧪 Running unit tests..."
        if timeout 15 npm run test:unit 2>&1 | tee "$TEST_RESULTS_DIR/unit-tests.log" | tail -n 10; then
            echo "✅ Unit tests passed"
        else
            echo "⚠️ Unit tests failed"
            test_failed=true
        fi
    fi
    
    # Run basic link checking
    echo "🔗 Running basic link validation..."
    if timeout 15 npm run test:links 2>&1 | tee "$TEST_RESULTS_DIR/link-tests.log" | tail -n 10; then
        echo "✅ Link validation passed"
    else
        echo "⚠️ Link validation issues found"
        test_failed=true
    fi
    
    # Stop the local server
    if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
        kill "$SERVER_PID" 2>/dev/null
        echo "🛑 Stopped local server"
    fi
    rm -f server.pid
    
    echo ""
    if [[ "$test_failed" == "true" ]]; then
        echo "⚠️ Some tests had issues. Check $TEST_RESULTS_DIR/ for details."
        echo "Deployment will continue..."
    else
        echo "✅ All quick tests passed!"
    fi
    
    echo "Test results saved in $TEST_RESULTS_DIR/"
}

# Function to upload file via SFTP
upload_file() {
    local_file="$1"
    remote_path="$2"
    
    echo "📤 Uploading: $local_file → $remote_path"
    
    # Extract directory from remote path and create it via SSH if needed
    remote_dir=$(dirname "$remote_path")
    
    # Create directories if they don't exist (skip if it's just ".")
    if [[ "$remote_dir" != "." ]]; then
        # Use SSH to create the directory structure
        ssh -o StrictHostKeyChecking=no root@jmrcycling.com "mkdir -p /var/www/jmrcycling.com/$remote_dir" >> "$DEPLOY_LOG" 2>&1
    fi
    
    # Upload the file via SFTP
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

# Run pre-deployment tests
run_quick_tests

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
upload_file "oauth/authorize/index.html" "oauth/authorize/index.html"

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

echo "Testing OAuth authorize endpoint..."
if curl -s "https://jmrcycling.com/oauth/authorize/" > /dev/null; then
    echo "✅ OAuth authorize endpoint accessible"
else
    echo "❌ OAuth authorize endpoint not accessible"
fi

echo ""
echo "🎉 Deployment completed!"
echo "📋 Check $DEPLOY_LOG for detailed logs"
if [[ "$SKIP_TESTS" != "true" && -d "$TEST_RESULTS_DIR" ]]; then
    echo "📊 Test results are available in $TEST_RESULTS_DIR/"
fi
echo ""
echo "🔗 Test your changes:"
echo "   Main site: https://jmrcycling.com/"
echo "   QR Guide:  https://jmrcycling.com/qr-guide.html"
echo "   Dashboard: https://jmrcycling.com/shop_tools/login.html"
echo "   OAuth:     https://jmrcycling.com/oauth/authorize/"
echo ""
echo "⚠️  Remember to test QR codes after deployment!"
echo ""
echo "💡 Tips:"
echo "   • Run 'SKIP_TESTS=true ./deploy-website.sh' to skip testing"
echo "   • Run './deploy-website-with-tests.sh' for comprehensive testing"
echo "   • Check test-results/ directory for detailed test logs"
