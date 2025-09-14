import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Premium.module.css";


export default function UserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.loggedIn) {
          setLoggedIn(true);
          setUser(data.user);
        } else {
          setLoggedIn(false);
        }
      } catch (err) {
        console.error("Error checking login:", err);
        setLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/"); // redirect to homepage
  };

  if (loading) {
    return <p style={{ color: "white", padding: "40px" }}>Loading...</p>;
  }

  if (!loggedIn) {
    return (
       <div className={styles.premiumContainer}>
        <h1>User Dashboard</h1>
        <p>You are not logged in.</p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={() => router.push("/login")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Go to Login
          </button>
          <button
            onClick={() => router.push("/register")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Register user
          </button>  
        </div>      
      </div>
    );
  }

  return (
    <div className={styles.premiumContainer}>
      <h1>User Dashboard</h1>
      <p>Welcome back, {user?.email || "User"}!</p>
      <p>Your plan: <strong>{user?.plan || "Free"}</strong></p>
      <button
        onClick={handleLogout}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}
