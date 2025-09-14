// lib/db.js
import mysql from "mysql2/promise";

let connection;

export async function getDB() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "fixbly",
    });
  }
  return connection;
}
