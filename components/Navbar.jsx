import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import { Menu, X, User, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);       // meniu mobil
  const [activeDropdown, setActiveDropdown] = useState(null); // dropdown activ pe mobil
    const router = useRouter();

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const handleMenuClick = (callback) => {
    setOpen(false); // închide meniul
    if (callback) callback();
  };

  return (
    <nav className={styles.navbar}>
      {/* Logo */}
      <div className={styles.logo}>
        <a href="/">fix<span style={{ color: "#facc15" }}>bly</span>.com</a>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Desktop & Mobile Menu */}
        <ul className={`${styles.menu} ${open ? styles.menuOpen : ""}`}>
          {/* Features */}
          <li className={styles.dropdown}>
            <button
              onClick={() => toggleDropdown("features")}
              className={styles.dropdownBtn}
            >
              Features <ChevronDown size={14} />
            </button>
            <ul
              className={`${styles.dropdownMenu} ${
                activeDropdown === "features" ? styles.dropdownOpen : ""
              }`}
            >
              <li><a href="#" onClick={() => handleMenuClick()}>How it works</a></li>
              <li><a href="#" onClick={() => handleMenuClick()}>Examples</a></li>
              <li><a href="#" onClick={() => handleMenuClick()}>Blog / Resources</a></li>
            </ul>
          </li>

          {/* Pricing */}
          <li>
            <button
              onClick={() =>
                handleMenuClick(() => router.push("/why-premium"))
              }
              className={styles.dropdownBtn}
            >
              Pricing
            </button>
          </li>

          {/* Support */}
          <li className={styles.dropdown}>
            <button
              onClick={() => toggleDropdown("support")}
              className={styles.dropdownBtn}
            >
              Support <ChevronDown size={14} />
            </button>
            <ul
              className={`${styles.dropdownMenu} ${
                activeDropdown === "support" ? styles.dropdownOpen : ""
              }`}
            >
              <li><a href="#" onClick={() => handleMenuClick()}>FAQ</a></li>
              <li><a href="#" onClick={() => handleMenuClick()}>Contact</a></li>
              <li><a href="#" onClick={() => handleMenuClick()}>Referral Program</a></li>
              <li><a href="#" onClick={() => handleMenuClick()}>My Account</a></li>
            </ul>
          </li>
        </ul>

        {/* Login Icon */}
        <div className={styles.loginIcon}>
          <User size={22} />
        </div>
      </div>

      {/* Hamburger (mobil) */}
      <button
        className={styles.hamburger}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X size={26} /> : <Menu size={26} />}
      </button>
    </nav>
  );
}
