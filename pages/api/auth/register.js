// pages/api/auth/register.js
import { getDB } from "@/lib/db";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password, plan } = req.body;

  try {
    const db = await getDB();

    // vezi dacă există deja user
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // hash parola înainte să o bagi în DB
    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (email, password, plan) VALUES (?, ?, ?)",
      [email, hashed, plan || "free"]
    );

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
