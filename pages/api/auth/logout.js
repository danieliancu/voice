// pages/api/auth/logout.js
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // ștergem cookie-ul de sesiune
  const cookie = serialize("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0), // expiră imediat
    path: "/",
  });

  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ message: "Logged out" });
}
