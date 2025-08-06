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
TEST_TIMEOUT=30

echo "📋 Deployment log: $DEPLOY_LOG"
echo "🧪 Test results directory: $TEST_RESULTS_DIR"

# Create directories if they don't exist
mkdir -p "$TEST_RESULTS_DIR"

# Function to cleanup on exit
cleanup() {
    echo "🧹 Cleaning up..."
    if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
        kill "$SERVER_PID" 2>/dev/null
        echo "🛑 Stopped local server (PID: $SERVER_PID)"
    fi
    rm -f server.pid KeepOnRollingTest_local.side 2>/dev/null
    echo "✨ Cleanup complete"
}

# Set trap to run cleanup on script exit
trap cleanup EXIT

# Function to run pre-deployment tests
run_pre_deployment_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        echo "⏭️ Skipping tests (SKIP_TESTS=true)"
        return 0
    fi

    echo ""
    echo "🧪 Running Pre-Deployment Tests"
    echo "================================"
    
    # Check for required tools
    echo "🔍 Checking test dependencies..."
    
    local missing_tools=()
    
    if ! command -v node &> /dev/null; then
        missing_tools+=("node")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    fi
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        echo "⚠️ Missing required tools: ${missing_tools[*]}"
        echo "Installing dependencies may fail, but continuing..."
    fi
    
    # Install/update dependencies
    echo "📦 Installing test dependencies..."
    npm install --silent || echo "⚠️ Some npm dependencies failed to install"
    
    # Start local server for testing
    echo "🚀 Starting local test server on port $LOCAL_SERVER_PORT..."
    
    # Kill any existing process on the port
    if lsof -Pi :$LOCAL_SERVER_PORT -sTCP:LISTEN -t > /dev/null; then
        echo "⚠️ Port $LOCAL_SERVER_PORT is already in use. Killing existing process..."
        kill $(lsof -t -i:$LOCAL_SERVER_PORT) 2>/dev/null || true
        sleep 2
    fi
    
    # Start server in background
    python3 -m http.server $LOCAL_SERVER_PORT > /dev/null 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > server.pid
    
    # Wait for server to start
    echo "⏳ Waiting for server to start..."
    sleep 5
    
    # Verify server is running
    if ! curl -s http://localhost:$LOCAL_SERVER_PORT > /dev/null; then
        echo "❌ Failed to start local server"
        return 1
    fi
    
    echo "✅ Server running at http://localhost:$LOCAL_SERVER_PORT"
    
    # Run different types of tests
    local test_failed=false
    
    echo ""
    echo "📝 Running Unit Tests..."
    if npm run test:unit 2>&1 | tee "$TEST_RESULTS_DIR/unit-tests.log"; then
        echo "✅ Unit tests passed"
    else
        echo "❌ Unit tests failed"
        test_failed=true
    fi
    
    echo ""
    echo "🎭 Running End-to-End Tests..."
    if timeout $TEST_TIMEOUT npm run test:e2e 2>&1 | tee "$TEST_RESULTS_DIR/e2e-tests.log"; then
        echo "✅ E2E tests passed"
    else
        echo "❌ E2E tests failed or timed out"
        test_failed=true
    fi
    
    echo ""
    echo "🤖 Running Selenium Tests..."
    # Create local version of Selenium test file
    if [[ -f "KeepOnRollingTest.side" ]]; then
        sed 's|"url": "https://jmrcycling.github.io/KOR/index.html"|"url": "http://localhost:'$LOCAL_SERVER_PORT'"|g' KeepOnRollingTest.side > KeepOnRollingTest_local.side
        
        if timeout $TEST_TIMEOUT npx selenium-side-runner KeepOnRollingTest_local.side --output-directory="$TEST_RESULTS_DIR" --timeout=30000 2>&1 | tee "$TEST_RESULTS_DIR/selenium-tests.log"; then
            echo "✅ Selenium tests passed"
        else
            echo "❌ Selenium tests failed or timed out"
            test_failed=true
        fi
        
        rm -f KeepOnRollingTest_local.side
    else
        echo "⚠️ Selenium test file not found, skipping"
    fi
    
    echo ""
    echo "♿ Running Accessibility Tests..."
    if timeout $TEST_TIMEOUT npm run test:accessibility 2>&1 | tee "$TEST_RESULTS_DIR/accessibility-tests.log"; then
        echo "✅ Accessibility tests passed"
    else
        echo "❌ Accessibility tests failed or timed out"
        test_failed=true
    fi
    
    echo ""
    echo "⚡ Running Performance Tests..."
    if timeout $TEST_TIMEOUT npm run test:performance 2>&1 | tee "$TEST_RESULTS_DIR/performance-tests.log"; then
        echo "✅ Performance tests passed"
    else
        echo "❌ Performance tests failed or timed out"
        test_failed=true
    fi
    
    echo ""
    echo "🔗 Running Link Validation..."
    if timeout $TEST_TIMEOUT npm run test:links 2>&1 | tee "$TEST_RESULTS_DIR/link-tests.log"; then
        echo "✅ Link validation passed"
    else
        echo "❌ Link validation failed or timed out"
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
        echo "❌ Some tests failed. Check $TEST_RESULTS_DIR/ for detailed logs."
        echo "⚠️ Deployment will continue, but review test failures!"
        echo ""
        read -p "Do you want to continue with deployment? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "🛑 Deployment cancelled by user"
            exit 1
        fi
    else
        echo "✅ All tests passed! Proceeding with deployment."
    fi
    
    echo "📊 Test results saved in $TEST_RESULTS_DIR/"
    echo "Deployment started at $(date)" >> "$DEPLOY_LOG"
    echo "Test results directory: $TEST_RESULTS_DIR" >> "$DEPLOY_LOG"
}

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

# Function to perform post-deployment verification
verify_deployment() {
    echo ""
    echo "🔍 Verifying deployment..."
    
    local verification_failed=false
    local verification_results="$TEST_RESULTS_DIR/verification-results.log"
    
    echo "Deployment verification started at $(date)" > "$verification_results"
    
    # Basic accessibility checks
    echo "Testing main page..."
    if curl -s "https://jmrcycling.com/" > /dev/null; then
        echo "✅ Main page accessible" | tee -a "$verification_results"
    else
        echo "❌ Main page not accessible" | tee -a "$verification_results"
        verification_failed=true
    fi

    echo "Testing QR guide page..."
    if curl -s "https://jmrcycling.com/qr-guide.html" > /dev/null; then
        echo "✅ QR guide page accessible" | tee -a "$verification_results"
    else
        echo "❌ QR guide page not accessible" | tee -a "$verification_results"
        verification_failed=true
    fi

    echo "Testing dashboard..."
    if curl -s "https://jmrcycling.com/shop_tools/dashboard.html" > /dev/null; then
        echo "✅ Dashboard accessible" | tee -a "$verification_results"
    else
        echo "❌ Dashboard not accessible" | tee -a "$verification_results"
        verification_failed=true
    fi

    echo "Testing signin page..."
    if curl -s "https://jmrcycling.com/shop_tools/personal_signin.html" > /dev/null; then
        echo "✅ Signin page accessible" | tee -a "$verification_results"
    else
        echo "❌ Signin page not accessible" | tee -a "$verification_results"
        verification_failed=true
    fi
    
    # Check if HTML contains critical elements
    echo "Checking for critical page elements..."
    if curl -s "https://jmrcycling.com/" | grep -q "header_grid"; then
        echo "✅ Header present on main page" | tee -a "$verification_results"
    else
        echo "❌ Header missing on main page" | tee -a "$verification_results"
        verification_failed=true
    fi
    
    if curl -s "https://jmrcycling.com/" | grep -q "footer"; then
        echo "✅ Footer present on main page" | tee -a "$verification_results"
    else
        echo "❌ Footer missing on main page" | tee -a "$verification_results"
        verification_failed=true
    fi
    
    # Advanced checks - could add more based on site requirements
    if [[ "$verification_failed" == "true" ]]; then
        echo "❌ Some verification checks failed! Review $verification_results"
        echo "⚠️ The site may have deployment issues!"
    else
        echo "✅ All verification checks passed!"
    fi
    
    echo "Deployment verification completed at $(date)" >> "$verification_results"
}

# Main script flow
echo "🔧 Starting deployment process..."

# Run pre-deployment tests
run_pre_deployment_tests

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

# Perform post-deployment verification
verify_deployment

echo ""
echo "🎉 Deployment completed!"
echo "📋 Check $DEPLOY_LOG for detailed logs"
echo "📊 Verification results in $TEST_RESULTS_DIR/verification-results.log"
echo ""
echo "🔗 Test your changes:"
echo "   Main site: https://jmrcycling.com/"
echo "   QR Guide:  https://jmrcycling.com/qr-guide.html"
echo "   Dashboard: https://jmrcycling.com/shop_tools/login.html"
echo ""
echo "⚠️  Remember to test QR codes after deployment!"
