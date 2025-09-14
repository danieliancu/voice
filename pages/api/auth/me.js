// pages/api/auth/me.js
import { getDB } from "@/lib/db";

export default async function handler(req, res) {
  const session = req.cookies.session;

  if (!session) {
    return res.status(200).json({ loggedIn: false });
  }

  try {
    const db = await getDB();
    const [rows] = await db.query("SELECT id, email, plan FROM users WHERE id = ?", [session]);

    if (rows.length === 0) {
      return res.status(200).json({ loggedIn: false });
    }

    return res.status(200).json({ loggedIn: true, user: rows[0] });
  } catch (err) {
    console.error("Me API error:", err);
    return res.status(500).json({ loggedIn: false });
  }
}
