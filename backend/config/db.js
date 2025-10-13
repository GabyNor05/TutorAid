const mysql = require("mysql2/promise");
require("dotenv").config();

// Conditionally set SSL options based on the environment
const sslOptions = process.env.NODE_ENV === 'production' 
  ? { ssl: { rejectUnauthorized: true } } 
  : {};

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...sslOptions // Spread the SSL options here
});

pool.getConnection()
  .then(connection => {
    console.log("✅ DB connected successfully!");
    connection.release();
  })
  .catch(err => console.error("DB connection error:", err));

module.exports = pool;