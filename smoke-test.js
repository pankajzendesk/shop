const http = require('node:http');
const { execSync } = require('node:child_process');

const PAGES = [
  '/',
  '/product-catalog',
  '/login',
  '/register',
  '/shopping-cart',
  '/admin/promotions',
  '/admin/products',
  '/admin/orders',
  '/admin/traffic',
  '/account-dashboard'
];

const BASE_URL = 'http://localhost:4028';

async function checkDatabase() {
  console.log('--- Database Integrity Check ---');
  try {
    // Check connection
    execSync(String.raw`echo "SELECT 1;" | npx prisma db execute --stdin`, { stdio: 'pipe' });
    console.log('[OK] Connection - Established');

    // Check Product Table Access
    const productOutput = execSync(String.raw`echo "SELECT count(*) FROM \"Product\";" | npx prisma db execute --stdin`, { encoding: 'utf8' });
    const productCountStr = productOutput.match(/\d+/) ? productOutput.match(/\d+/)[0] : '0';
    console.log(`[OK] Product Table - Accessible (Count: ${productCountStr})`);

    // Check Order Table Access
    const orderOutput = execSync(String.raw`echo "SELECT count(*) FROM \"Order\";" | npx prisma db execute --stdin`, { encoding: 'utf8' });
    const orderCountStr = orderOutput.match(/\d+/) ? orderOutput.match(/\d+/)[0] : '0';
    console.log(`[OK] Order Table - Accessible (Count: ${orderCountStr})\n`);
    
    return true;
  } catch (err) {
    console.error('[FAIL] Database Check - Failed to query database schema.', err.message);
    return false;
  }
}

async function checkPage(path) {
  return new Promise((resolve) => {
    const req = http.get(`${BASE_URL}${path}`, (res) => {
      console.log(`[${res.statusCode === 200 ? 'OK' : 'FAIL'}] ${path} - Status: ${res.statusCode}`);
      resolve(res.statusCode === 200);
    });
    
    req.on('error', (err) => {
      console.log(`[ERROR] ${path} - ${err.code} ${err.message}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log(`[TIMEOUT] ${path}`);
      req.destroy();
      resolve(false);
    });
  });
}

async function runTests() {
  console.log(`Starting smoke tests on ${BASE_URL}...\n`);
  let allPassed = true;

  // 1. Database Check
  try {
    const dbPassed = await checkDatabase();
    if (!dbPassed) allPassed = false;
  } catch (err) {
    console.error('Unexpected error during database check:', err);
    allPassed = false;
  }

  console.log('--- Page Load Checks ---');
  for (const path of PAGES) {
    try {
      const passed = await checkPage(path);
      if (!passed) allPassed = false;
    } catch (err) {
      console.error(`Error checking page ${path}:`, err);
      allPassed = false;
    }
  }

  console.log('\n--- Result ---');
  if (allPassed) {
    console.log('✅ All pages loaded successfully!');
    process.exit(0);
  } else {
    console.log('❌ Some pages failed to load. Please check if the server is running on port 4028.');
    process.exit(1);
  }
}

try {
  await runTests();
} catch (e) {
  console.error('Smoke test runner failed:', e);
  process.exit(1);
}
