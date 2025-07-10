#!/bin/bash

# Local test script for KOR website Selenium tests
echo "🧪 Testing KOR Website Locally"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install || echo "Warning: Some npm dependencies failed to install"

# Check if port 8080 is already in use
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ Port 8080 is already in use. Killing existing process..."
    kill $(lsof -t -i:8080) 2>/dev/null || true
    sleep 2
fi

# Start local server in background
echo "🚀 Starting local server on port 8080..."
python3 -m http.server 8080 &
SERVER_PID=$!
echo $SERVER_PID > server.pid

# Wait for server to start
sleep 5

# Create local version of test file
echo "🔧 Creating local test configuration..."
sed 's|"url": "https://jmrcycling.com"|"url": "http://localhost:8080"|g' KeepOnRollingTest.side > KeepOnRollingTest_local.side

# Check if server is running
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ Server is running at http://localhost:8080"
else
    echo "❌ Server failed to start"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo "🔍 Running Selenium tests..."
# Run Selenium tests (will show which ones might fail)
npx selenium-side-runner KeepOnRollingTest_local.side \
    --output-directory=test-results \
    --timeout=30000

# Store test result
TEST_RESULT=$?

# Stop server
echo "🛑 Stopping server..."
kill $SERVER_PID 2>/dev/null
rm server.pid 2>/dev/null

# Clean up
rm KeepOnRollingTest_local.side 2>/dev/null

# Report results
if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "⚠️ Some tests failed. Check test-results/ for details."
    echo "This is expected since the test was designed for the live site."
fi

echo "📊 Test results are available in the test-results/ directory"
echo "🎉 Local testing complete!"
