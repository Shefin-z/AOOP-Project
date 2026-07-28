const mysql = require("mysql2/promise");

const isProduction = process.env.NODE_ENV === "production";
const databaseEnv = {
  host: process.env.MYSQL_HOST || process.env.TIDB_HOST,
  port: process.env.MYSQL_PORT || process.env.TIDB_PORT,
  user: process.env.MYSQL_USER || process.env.TIDB_USER,
  password: process.env.MYSQL_PASSWORD || process.env.TIDB_PASSWORD,
  database: process.env.MYSQL_DATABASE || process.env.TIDB_DATABASE,
};
if (isProduction) {
  const missing = Object.entries(databaseEnv).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) throw new Error(`Missing production database configuration: ${missing.join(", ")}`);
}

const connectionOptions = {
  host: databaseEnv.host || "127.0.0.1",
  port: Number(databaseEnv.port || 3306),
  user: databaseEnv.user || "careerforge",
  password: databaseEnv.password || "careerforge",
  database: databaseEnv.database || "careerforge",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "Z",
  ssl: process.env.MYSQL_SSL === "true" || process.env.TIDB_HOST
    ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
    : undefined,
};

const pool = mysql.createPool(connectionOptions);

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = { pool, query, connectionOptions };
