// pages/api/auth/login.js
import { getDB } from "@/lib/db";
import { serialize } from "cookie";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;

  try {
    const db = await getDB();
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const cookie = serialize("session", String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    res.setHeader("Set-Cookie", cookie);
    return res.status(200).json({ message: "Login successful", userId: user.id, plan: user.plan });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
