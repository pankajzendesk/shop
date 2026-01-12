const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const dotenv = require('dotenv');
const net = require('node:net');
const path = require('node:path');

// Load environment variables from .env
dotenv.config();

// Try to use the generated client from the project's src/generated/client
let PrismaClient;
try {
  const generatedPath = path.join(__dirname, 'src', 'generated', 'client');
  const clientModule = require(generatedPath);
  PrismaClient = clientModule.PrismaClient;
  console.log('📦 Using generated Prisma Client from src/generated/client');
} catch (error) {
  try {
    const clientModule = require('@prisma/client');
    PrismaClient = clientModule.PrismaClient;
    console.log('📦 Using default @prisma/client');
  } catch (innerError) {
    console.error('❌ Error: Could not find PrismaClient. Run npm install or npx prisma generate.');
    console.error(error.message, innerError.message);
    process.exit(1);
  }
}

/**
 * Pings a host and port
 */
function pingHost(host, port, timeout = 2000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = 'closed';
    let errorMsg = '';

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      status = 'open';
      socket.destroy();
    });

    socket.on('timeout', () => {
      status = 'timeout';
      socket.destroy();
    });

    socket.on('error', (err) => {
      status = 'error';
      errorMsg = err.message;
    });

    socket.on('close', () => {
      resolve({ status, errorMsg });
    });

    socket.connect(port, host === 'localhost' ? '127.0.0.1' : host);
  });
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  
  console.log('--- Database Connection Test ---');
  
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  // Parse connection string for ping
  let host = '127.0.0.1';
  let port = 5432;
  try {
    // Basic extraction of host and port
    const parts = connectionString.split('@');
    if (parts.length > 1) {
      const hostPortPart = parts[1].split('/')[0];
      const hp = hostPortPart.split(':');
      host = hp[0];
      port = hp[1] ? Number.parseInt(hp[1], 10) : 5432;
    }
    if (host === 'localhost') host = '127.0.0.1';
  } catch (error) {
    console.warn('⚠️  Parsing DATABASE_URL for ping test failed, using defaults.', error.message);
  }

  console.log(`🌐 Step 1: Pinging ${host}:${port}...`);
  const { status, errorMsg } = await pingHost(host, port);
  
  if (status === 'open') {
    console.log('✅ Port is open and reachable.');
    
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
      // 1. Test raw pg connection
      console.log('🐘 Step 2: Testing raw pg driver connection...');
      const rawRes = await pool.query('SELECT NOW()');
      console.log('✅ pg driver: SUCCESS (Server time: ' + rawRes.rows[0].now + ')');

      // 2. Test Prisma
      console.log('💎 Step 3: Testing Prisma Client...');
      await prisma.$connect();
      console.log('✅ Prisma connect: SUCCESS');

      console.log('🔍 Step 4: Checking database schema...');
      const tables = await prisma.$queryRawUnsafe(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const tableNames = tables.map(t => t.table_name);
      console.log('📂 Found tables:', tableNames.join(', ') || 'No tables found');

      if (tableNames.some(t => t.toLowerCase() === 'user')) {
        const userCount = await prisma.user.count();
        console.log(`👤 User table found: ${userCount} records`);
      } else {
        console.log('⚠️  User table NOT found in public schema.');
      }

    } catch (error) {
      console.error('❌ Error during database operations:');
      console.error(error.message || error);
    } finally {
      try {
        await prisma.$disconnect();
        await pool.end();
      } catch (disconnectError) {
        console.warn('⚠️  Error during disconnect:', disconnectError.message);
      }
    }
  } else {
    console.error(`❌ Port ${port} is NOT reachable on ${host} (${status}).`);
    console.error(`Error details: ${errorMsg}`);
    console.log('\n💡 Troubleshooting Tips:');
    console.log('1. Ensure your PostgreSQL service is started.');
    console.log('2. Check if the port matches your database configuration.');
    console.log('3. If using Docker, ensure the container is running and the port is mapped.');
  }
  console.log('-------------------------------');
}

try {
  await main();
} catch (error) {
  console.error('💥 Fatal error in script:', error);
  process.exit(1);
}
