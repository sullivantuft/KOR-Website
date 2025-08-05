/**
 * Uptime and Broken Link Checker
 * Monitors website availability and checks for broken links.
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// ==========================================
// CONFIGURATION
// ==========================================

const TARGET_URL = 'http://localhost:8080';
const TIMEOUT = 5000; // 5 seconds

// ==========================================
// UPTIME CHECK
// ==========================================

async function checkUptime() {
  return new Promise(resolve => {
    const protocol = new URL(TARGET_URL).protocol === 'https:' ? https : http;

    const req = protocol.get(TARGET_URL, res => {
      console.log(`✅ Uptime check successful! Status: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', err => {
      console.error('❌ Uptime check failed:', err.message);
      resolve(false);
    });

    req.setTimeout(TIMEOUT, () => {
      req.abort();
      console.error('❌ Uptime check timed out!');
      resolve(false);
    });
  });
}

// ==========================================
// BROKEN LINK CHECKER
// ==========================================

async function checkBrokenLinks() {
  console.log('\n🔍 Checking for broken links...');

  const visited = new Set();
  const brokenLinks = [];

  async function crawl(url) {
    if (visited.has(url)) return;
    visited.add(url);

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'KOR-Link-Checker/1.0' }
      });

      if (!response.ok) {
        console.error(`  ❌ Broken link: ${url} (Status: ${response.status})`);
        brokenLinks.push({ url, status: response.status });
        return;
      }

      console.log(`  ✅ Checked: ${url}`);

      // If the response is HTML, parse for more links
      if (response.headers.get('content-type')?.includes('text/html')) {
        const html = await response.text();
        const links = html.match(/href="(.*?)"/g) || [];

        for (const link of links) {
          const nextUrl = new URL(link.slice(6, -1), url).href;
          if (nextUrl.startsWith(TARGET_URL)) {
            await crawl(nextUrl);
          }
        }
      }
    } catch (error) {
      console.error(`  ❌ Broken link: ${url} (Error: ${error.message})`);
      brokenLinks.push({ url, error: error.message });
    }
  }

  await crawl(TARGET_URL);

  if (brokenLinks.length > 0) {
    console.log(`\n❌ Found ${brokenLinks.length} broken links.`);
    return false;
  } else {
    console.log('\n✅ No broken links found!');
    return true;
  }
}

// ==========================================
// MAIN EXECUTION
// ==========================================

async function main() {
  console.log('🚀 Starting website monitoring...');

  const uptimeSuccess = await checkUptime();
  const linksSuccess = await checkBrokenLinks();

  if (uptimeSuccess && linksSuccess) {
    console.log('\n🎉 All checks passed!');
    process.exit(0);
  } else {
    console.error('\n❌ Some checks failed.');
    process.exit(1);
  }
}

main();
