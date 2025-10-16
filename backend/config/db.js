const mysql = require('mysql2/promise');
require('dotenv').config();

const required = ['DB_HOST','DB_USER','DB_PASSWORD','DB_NAME'];
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
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {})
});

module.exports = pool;