# KOR Deployment Scripts

This document describes the deployment scripts for the KOR (Keep On Rolling) website with integrated testing capabilities.

## Available Scripts

### 1. `deploy-website.sh` (Updated with Quick Testing)
The main deployment script with integrated quick tests.

**Features:**
- ✅ Quick pre-deployment tests (HTML validation, linting, unit tests, link checking)
- ✅ File upload via SFTP
- ✅ Post-deployment verification
- ✅ Configurable test behavior
- ✅ Cleanup on exit

**Usage:**
```bash
# Standard deployment with quick tests
./deploy-website.sh

# Skip all tests and deploy immediately  
SKIP_TESTS=true ./deploy-website.sh

# Skip only the quick tests but keep verification
RUN_QUICK_TESTS=false ./deploy-website.sh
```

### 2. `deploy-website-with-tests.sh` (Comprehensive Testing)
An enhanced deployment script with comprehensive testing suite.

**Features:**
- 🧪 Full test suite (unit, e2e, selenium, accessibility, performance)
- 🔍 Advanced verification checks
- 👤 Interactive deployment confirmation on test failures
- 📊 Detailed test result logging
- 🧹 Automatic cleanup

**Usage:**
```bash
# Comprehensive deployment with all tests
./deploy-website-with-tests.sh

# Skip tests entirely
SKIP_TESTS=true ./deploy-website-with-tests.sh
```

### 3. `test-local-simple.sh` ⚡ (Fast Local Testing - Recommended)
Quick and efficient local testing script that avoids hanging and completes in under 2 minutes.

**Features:**
- ⚡ **Fast execution** - Completes quickly without hanging
- 🌐 Smart port management (auto-detection and cleanup)
- 🔍 Basic health checks (HTML structure, file existence, HTTP responses)
- 🤖 Selenium tests with timeout protection
- 🧹 Automatic cleanup and server management
- 📊 Quick npm tests (validate, lint) with timeout

**Usage:**
```bash
# Quick testing (recommended for daily use)
./test-local-simple.sh

# Use custom port
LOCAL_SERVER_PORT=3000 ./test-local-simple.sh

# Run only Selenium tests (fastest)
RUN_SELENIUM_ONLY=true ./test-local-simple.sh
```

### 4. `test-local.sh` (Comprehensive Local Testing)
Full-featured testing script with all available test suites (may take longer).

**Features:**
- 🌐 Smart port management (auto-detection and fallback)
- 🧪 Full test suite (HTML validation, linting, unit, E2E, Selenium, accessibility, performance, links)
- 🔧 Automatic test configuration updates for localhost
- 📊 Detailed test result reporting
- 🧹 Automatic cleanup and server management
- ⚙️ Configurable test behavior

**Usage:**
```bash
# Basic testing (Unit + Selenium only - default)
./test-local.sh

# Enable comprehensive testing
RUN_ALL_TESTS=true ./test-local.sh

# Use custom port
LOCAL_SERVER_PORT=3000 ./test-local.sh

# Custom timeout and server wait time
TEST_TIMEOUT=60 SERVER_START_WAIT=10 ./test-local.sh
```

## Environment Variables

### Deployment Scripts

| Variable | Default | Description |
|----------|---------|-------------|
| `SKIP_TESTS` | `false` | Skip all testing when set to `true` |
| `RUN_QUICK_TESTS` | `true` | Enable/disable quick tests in main script |
| `TEST_TIMEOUT` | `30` | Timeout in seconds for individual test suites |
| `LOCAL_SERVER_PORT` | `8080` | Port for local test server |

### test-local.sh Additional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `RUN_ALL_TESTS` | `false` | Enable/disable comprehensive test suite |
| `SERVER_START_WAIT` | `3` | Seconds to wait for local server to start |
| `SKIP_SLOW_TESTS` | `true` | Skip tests that might hang |
| `TEST_RESULTS_DIR` | `test-results` | Directory to store test results |

### test-local-simple.sh Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `RUN_SELENIUM_ONLY` | `false` | Run only Selenium tests (fastest mode) |
| `LOCAL_SERVER_PORT` | `8080` | Port for local test server |
| `TEST_RESULTS_DIR` | `test-results` | Directory to store test results |

## Test Types

### Quick Tests (deploy-website.sh)
- **HTML Validation**: Validates HTML markup
- **Code Linting**: Checks JavaScript, CSS, and HTML style
- **Unit Tests**: Runs Jest unit tests if available
- **Link Validation**: Checks for broken links

### Comprehensive Tests (deploy-website-with-tests.sh)
- **Unit Tests**: Jest-based unit testing
- **End-to-End Tests**: Playwright browser automation
- **Selenium Tests**: Cross-browser compatibility testing  
- **Accessibility Tests**: Pa11y accessibility checking
- **Performance Tests**: Lighthouse performance audits
- **Link Validation**: Comprehensive link checking

## Test Results

All test results are saved in the `test-results/` directory:

```
test-results/
├── unit-tests.log
├── e2e-tests.log
├── selenium-tests.log
├── accessibility-tests.log
├── performance-tests.log
├── link-tests.log
├── validation-tests.log
├── lint-tests.log
└── verification-results.log
```

## Dependencies

The testing functionality requires:

- **Node.js** (v16+)
- **npm** (for package management)
- **Python 3** (for local server)
- **curl** (for verification checks)

Install test dependencies:
```bash
npm install
```

## Deployment Flow

### Standard Deployment (deploy-website.sh)
1. 🔍 **Pre-flight checks** - Verify environment and dependencies
2. 🧪 **Quick tests** - Run essential tests (if enabled)
3. 📤 **File upload** - Upload modified and new files via SFTP
4. ✅ **Verification** - Test deployed site accessibility
5. 📋 **Results** - Display deployment summary and test results

### Comprehensive Deployment (deploy-website-with-tests.sh)  
1. 🔍 **Pre-flight checks** - Verify environment and dependencies
2. 🚀 **Local server** - Start test server on localhost:8080
3. 🧪 **Full test suite** - Run all available test types
4. ❓ **User confirmation** - Prompt to continue if tests fail
5. 📤 **File upload** - Upload files via SFTP
6. ✅ **Advanced verification** - Comprehensive post-deployment checks
7. 📊 **Results** - Detailed deployment and test summary

## File Structure

```
KOR/
├── deploy-website.sh              # Main deployment script (with quick tests)
├── deploy-website-with-tests.sh   # Comprehensive deployment script
├── test-local-simple.sh           # Fast local testing (recommended)
├── test-local.sh                  # Comprehensive local testing
├── DEPLOYMENT.md                  # This documentation
├── package.json                   # NPM dependencies and test scripts
├── KeepOnRollingTest.side         # Selenium test suite
├── tests/                         # Test files
│   ├── e2e/                       # End-to-end tests
│   ├── unit/                      # Unit tests
│   ├── accessibility/             # Accessibility tests
│   └── performance/               # Performance tests
└── test-results/                  # Generated test results
```

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   chmod +x deploy-website.sh
   chmod +x deploy-website-with-tests.sh
   chmod +x test-local.sh
   ```

2. **Port 8080 Already in Use**
   - The script will automatically kill existing processes on port 8080
   - Or manually kill: `lsof -ti :8080 | xargs kill`

3. **Missing Dependencies**
   ```bash
   npm install
   ```

4. **SFTP Connection Issues**
   - Verify SSH key is configured for root@jmrcycling.com
   - Check network connectivity
   - Verify server permissions

### Test Failures

- Test failures don't stop deployment by default (configurable)
- Review logs in `test-results/` directory for details
- Use `SKIP_TESTS=true` to bypass testing if needed

## Best Practices

1. **Always run tests** before deploying to production
2. **Review test results** in the `test-results/` directory
3. **Fix failing tests** before deployment when possible
4. **Use quick tests** for rapid iterations during development
5. **Use comprehensive tests** for production deployments
6. **Keep dependencies updated** with `npm update`
7. **Monitor deployment logs** for upload issues

## Examples

```bash
# Quick development deployment
./deploy-website.sh

# Production deployment with full testing
./deploy-website-with-tests.sh

# Emergency deployment (skip tests)
SKIP_TESTS=true ./deploy-website.sh

# Test-only run (no deployment)
./test-local.sh

# Custom configuration
TEST_TIMEOUT=60 LOCAL_SERVER_PORT=3000 ./deploy-website-with-tests.sh
```
