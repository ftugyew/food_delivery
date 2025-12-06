const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  ssl: {
    require: true,
    rejectUnauthorized: false
  },
  connectTimeout: 20000
});

const testConnection = async () => {
  try {
    await pool.getConnection();
    console.log("🟢 Railway MySQL Connected Successfully");
  } catch (error) {
    console.error("🔴 MySQL Connection Error:", error.code);
  }
};

testConnection();

module.exports = pool;
