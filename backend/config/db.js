const mysql = require('mysql2/promise');
require('dotenv').config();

const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error('Missing DB env vars:', missing);
  throw new Error(`Missing DB env vars: ${missing.join(', ')}`);
}

console.log('[DB] connecting', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  db: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true'
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 8,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

pool.on('error', (e) => {
  console.error('[mysql pool error]', e.code, e.message);
});

module.exports = pool;