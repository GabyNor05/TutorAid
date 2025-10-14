const mysql = require('mysql2/promise');
require('dotenv').config();

const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  throw new Error(`Missing DB env vars: ${missing.join(', ')}`);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,           // e.g. mysql-youracct.alwaysdata.net
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,           // e.g. youracct_dbuser
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,       // e.g. youracct_dbname
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {})
});

module.exports = pool;