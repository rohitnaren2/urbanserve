import pool from "./backend/config/database.js";

try {
  const [rows] = await pool.query("SHOW TABLES");

  console.log("✅ Database Connected Successfully");
  console.log(rows);

  process.exit();
} catch (err) {
  console.error("❌ Database Connection Failed");
  console.error(err);
}