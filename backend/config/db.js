const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    // This is required to connect to Azure
    rejectUnauthorized: true
  }
});

pool.getConnection()
  .then(connection => {
    console.log("✅ DB connected successfully!");
    connection.release();
  })
  .catch(err => console.error("DB connection error:", err));

module.exports = pool;