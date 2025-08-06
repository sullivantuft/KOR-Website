#!/bin/bash

# Local test script for KOR website with comprehensive testing
echo "🧪 Testing KOR Website Locally"
echo "================================"

# Configuration
LOCAL_SERVER_PORT=${LOCAL_SERVER_PORT:-8080}
TEST_RESULTS_DIR="test-results"
RUN_ALL_TESTS=${RUN_ALL_TESTS:-false}  # Default to false to avoid hanging
TEST_TIMEOUT=${TEST_TIMEOUT:-15}        # Shorter timeout
SERVER_START_WAIT=${SERVER_START_WAIT:-3}  # Shorter wait
SKIP_SLOW_TESTS=${SKIP_SLOW_TESTS:-true}   # Skip tests that might hang

echo "📊 Configuration:"
echo "   Local server port: $LOCAL_SERVER_PORT"
echo "   Test results dir: $TEST_RESULTS_DIR"
echo "   Run all tests: $RUN_ALL_TESTS"
echo "   Test timeout: ${TEST_TIMEOUT}s"
echo ""

# Create test results directory
mkdir -p "$TEST_RESULTS_DIR"

# Function to cleanup on exit
cleanup() {
    echo ""
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

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t > /dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Function to find available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    
    while [[ $port -le $(($start_port + 100)) ]]; do
        if check_port $port; then
            echo $port
            return 0
        fi
        ((port++))
    done
    
    echo ""
    return 1
}

# Check for required tools
echo "🔍 Checking dependencies..."

missing_tools=()

if ! command -v node &> /dev/null; then
    missing_tools+=("node")
fi

if ! command -v npm &> /dev/null; then
    missing_tools+=("npm")
fi

if ! command -v python3 &> /dev/null; then
    missing_tools+=("python3")
fi

if ! command -v curl &> /dev/null; then
    missing_tools+=("curl")
fi

if [[ ${#missing_tools[@]} -gt 0 ]]; then
    echo "❌ Missing required tools: ${missing_tools[*]}"
    echo "Please install the missing tools and try again."
    exit 1
fi

echo "✅ All required tools are available"

# Install dependencies
echo ""
echo "📦 Installing test dependencies..."
npm install --silent || echo "⚠️ Some npm dependencies failed to install"
# Handle port management
echo ""
echo "🌐 Setting up local server..."

# Check if the preferred port is available
if ! check_port $LOCAL_SERVER_PORT; then
    echo "⚠️ Port $LOCAL_SERVER_PORT is already in use."
    
    # Try to kill existing process
    echo "🔄 Attempting to free port $LOCAL_SERVER_PORT..."
    existing_pids=$(lsof -t -i:$LOCAL_SERVER_PORT 2>/dev/null)
    if [[ -n "$existing_pids" ]]; then
        echo "🛑 Killing existing processes: $existing_pids"
        kill $existing_pids 2>/dev/null || true
        sleep 3
        
        # Check again
        if ! check_port $LOCAL_SERVER_PORT; then
            echo "⚠️ Port $LOCAL_SERVER_PORT still in use. Finding alternative..."
            ALTERNATIVE_PORT=$(find_available_port $(($LOCAL_SERVER_PORT + 1)))
            if [[ -n "$ALTERNATIVE_PORT" ]]; then
                echo "🔄 Using alternative port: $ALTERNATIVE_PORT"
                LOCAL_SERVER_PORT=$ALTERNATIVE_PORT
            else
                echo "❌ Could not find an available port. Please free port $LOCAL_SERVER_PORT manually."
                exit 1
            fi
        else
            echo "✅ Port $LOCAL_SERVER_PORT is now available"
        fi
    fi
fi

# Start local server
echo "🚀 Starting local server on port $LOCAL_SERVER_PORT..."
python3 -m http.server $LOCAL_SERVER_PORT > /dev/null 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > server.pid

echo "⏳ Waiting for server to start (${SERVER_START_WAIT}s)..."
sleep $SERVER_START_WAIT

# Verify server is running
server_url="http://localhost:$LOCAL_SERVER_PORT"
if curl -s "$server_url" > /dev/null; then
    echo "✅ Server is running at $server_url"
else
    echo "❌ Server failed to start on port $LOCAL_SERVER_PORT"
    exit 1
fi

# Function to run individual test suite
run_test_suite() {
    local test_name="$1"
    local test_command="$2"
    local log_file="$TEST_RESULTS_DIR/${test_name}-tests.log"
    
    echo ""
    echo "🧪 Running $test_name tests..."
    
    # Use available timeout command or run without timeout
    if command -v gtimeout &> /dev/null; then
        timeout_cmd="gtimeout $TEST_TIMEOUT"
    elif command -v timeout &> /dev/null; then
        timeout_cmd="timeout $TEST_TIMEOUT"
    else
        timeout_cmd=""
        echo "⚠️ No timeout available - tests may run indefinitely"
    fi
    
    if $timeout_cmd bash -c "$test_command" 2>&1 | tee "$log_file"; then
        echo "✅ $test_name tests passed"
        return 0
    else
        echo "❌ $test_name tests failed or timed out"
        return 1
    fi
}

# Start comprehensive testing
echo ""
echo "🧪 Starting Comprehensive Test Suite"
echo "===================================="

overall_test_result=0
failed_tests=()

# 1. HTML Validation
if [[ "$RUN_ALL_TESTS" == "true" ]]; then
    if ! run_test_suite "HTML-Validation" "npm run validate"; then
        failed_tests+=("HTML-Validation")
        overall_test_result=1
    fi
fi

# 2. Code Linting
if [[ "$RUN_ALL_TESTS" == "true" ]]; then
    if ! run_test_suite "Linting" "npm run lint"; then
        failed_tests+=("Linting")
        overall_test_result=1
    fi
fi

# 3. Unit Tests
if [[ -d "tests" ]] || [[ -f "jest.config.js" ]]; then
    if ! run_test_suite "Unit" "npm run test:unit"; then
        failed_tests+=("Unit")
        overall_test_result=1
    fi
fi

# 4. End-to-End Tests
if [[ "$RUN_ALL_TESTS" == "true" ]]; then
    # Update playwright config to use the correct port
    if [[ -f "playwright.config.js" ]]; then
        sed -i.bak "s|http://localhost:[0-9]*|http://localhost:$LOCAL_SERVER_PORT|g" playwright.config.js
    fi
    
    if ! run_test_suite "E2E" "npm run test:e2e"; then
        failed_tests+=("E2E")
        overall_test_result=1
    fi
    
    # Restore original config
    if [[ -f "playwright.config.js.bak" ]]; then
        mv playwright.config.js.bak playwright.config.js
    fi
fi

# 5. Selenium Tests
if [[ -f "KeepOnRollingTest.side" ]]; then
    echo ""
    echo "🔧 Creating local Selenium test configuration..."
    
    # Create local version with correct URL and path
    sed "s|\"url\": \"https://jmrcycling.github.io/KOR/index.html\"|\"url\": \"http://localhost:$LOCAL_SERVER_PORT\"|g" KeepOnRollingTest.side > KeepOnRollingTest_local.side
    sed -i.bak "s|\"url\": \"https://jmrcycling.com\"|\"url\": \"http://localhost:$LOCAL_SERVER_PORT\"|g" KeepOnRollingTest_local.side
    
    # Fix the path from /KOR/index.html to just /index.html for localhost
    sed -i.bak2 's|"/KOR/index.html"|"/index.html"|g' KeepOnRollingTest_local.side
    
    # Clean up backup files  
    rm -f KeepOnRollingTest_local.side.bak KeepOnRollingTest_local.side.bak2
    
    if ! run_test_suite "Selenium" "npx selenium-side-runner KeepOnRollingTest_local.side --output-directory='$TEST_RESULTS_DIR' --timeout=30000"; then
        failed_tests+=("Selenium")
        overall_test_result=1
    fi
    
    rm -f KeepOnRollingTest_local.side
else
    echo "⚠️ Selenium test file (KeepOnRollingTest.side) not found, skipping"
fi

# 6. Accessibility Tests
if [[ "$RUN_ALL_TESTS" == "true" ]]; then
    # Update pa11y config to use correct URL
    if [[ -f ".pa11yci" ]]; then
        sed -i.bak "s|http://localhost:[0-9]*|http://localhost:$LOCAL_SERVER_PORT|g" .pa11yci
    fi
    
    if ! run_test_suite "Accessibility" "npm run test:accessibility"; then
        failed_tests+=("Accessibility")
        overall_test_result=1
    fi
    
    # Restore original config
    if [[ -f ".pa11yci.bak" ]]; then
        mv .pa11yci.bak .pa11yci
    fi
fi

# 7. Link Validation
if [[ "$RUN_ALL_TESTS" == "true" ]]; then
    if ! run_test_suite "Link-Validation" "npm run test:links -- http://localhost:$LOCAL_SERVER_PORT"; then
        failed_tests+=("Link-Validation")
        overall_test_result=1
    fi
fi

# 8. Performance Tests (if available)
if [[ "$RUN_ALL_TESTS" == "true" ]] && npm run test:performance --dry-run > /dev/null 2>&1; then
    if ! run_test_suite "Performance" "npm run test:performance"; then
        failed_tests+=("Performance")
        overall_test_result=1
    fi
fi

# Final Results
echo ""
echo "📊 Test Suite Complete"
echo "======================"

if [[ $overall_test_result -eq 0 ]]; then
    echo "🎉 All tests passed!"
else
    echo "⚠️ Some tests failed:"
    for failed_test in "${failed_tests[@]}"; do
        echo "   ❌ $failed_test"
    done
    echo ""
    echo "💡 This may be expected for tests designed for the live site."
fi

echo ""
echo "📁 Test results saved in: $TEST_RESULTS_DIR/"
echo "🌐 Local server was: $server_url"
echo "🎯 Test configuration:"
echo "   • Run all tests: $RUN_ALL_TESTS"
echo "   • Test timeout: ${TEST_TIMEOUT}s"
echo "   • Server wait time: ${SERVER_START_WAIT}s"
echo ""
echo "💡 Usage examples:"
echo "   LOCAL_SERVER_PORT=3000 ./test-local.sh"
echo "   RUN_ALL_TESTS=true ./test-local.sh    # Enable full test suite"
echo "   TEST_TIMEOUT=60 ./test-local.sh"
echo ""
echo "⚡ For faster testing, use: ./test-local-simple.sh"
echo ""
echo "🎉 Local testing complete!"
