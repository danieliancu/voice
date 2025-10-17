import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import { useSound } from "@/lib/SoundContext";
import { Menu, X, User, ChevronDown, Volume2, VolumeX, Globe } from "lucide-react";
import { useLanguage, availableLanguages } from "@/lib/LanguageContext";
import UserModal from "@/components/UserModal"; // 👈 import corect

export default function Navbar() {
  const [open, setOpen] = useState(false); // meniu mobil
  const [activeDropdown, setActiveDropdown] = useState(null); // dropdown activ
  const [loggedIn, setLoggedIn] = useState(false); // status login
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false); // 👈 modal user

  const router = useRouter();
  const { language, setLanguage, header } = useLanguage();
  const { soundOn, setSoundOn } = useSound();



// verifică login la mount + când se schimbă ruta
useEffect(() => {
  const checkLogin = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setLoggedIn(data.loggedIn);

      if (!data.loggedIn) {
        // 👇 forțează limba pe engleză dacă nu e logat
        setLanguage("en");
      }
    } catch (err) {
      console.error("Login check failed:", err);
      setLoggedIn(false);
      // 👇 fallback: și aici forțăm engleza
      setLanguage("en");
    }
  };
  checkLogin();
}, [router.asPath, setLanguage]);

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const handleNavClick = (url) => {
    setOpen(false);
    router.push(url);
  };

  return (
    <div style={{position: "relative",zIndex: 400,height: "60px", width:"100%"}}>

      <nav className={styles.navbar}>
        {/* Logo */}
        <div className={styles.logo}>
          <Link href="/" className={styles.logoLink}>
            fix<span style={{ color: "orange" }}>bly</span>.com
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center"}}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* Meniu */}
            <ul className={`${styles.menu} ${open ? styles.menuOpen : ""}`}>
              {/* Features */}
              <li className={styles.dropdown}>
                <button
                  onClick={() => toggleDropdown("features")}
                  className={styles.dropdownBtn}
                >
                  {header?.menu?.features} <ChevronDown size={14} />
                </button>
                <ul
                  className={`${styles.dropdownMenu} ${
                    activeDropdown === "features" ? styles.dropdownOpen : ""
                  }`}
                >
                  <li><a onClick={() => handleNavClick("#")}>{header?.features?.how}</a></li>
                  <li><a onClick={() => handleNavClick("#")}>{header?.features?.examples}</a></li>
                  <li><a onClick={() => handleNavClick("#")}>{header?.features?.blog}</a></li>
                </ul>


              </li>

              {/* Pricing */}
              <li>
                <button
                  onClick={() => handleNavClick("/why-premium")}
                  className={styles.dropdownBtn}
                >
                  {header?.menu?.pricing}
                </button>
              </li>

              {/* Support */}
              <li className={styles.dropdown}>
                <button
                  onClick={() => toggleDropdown("support")}
                  className={styles.dropdownBtn}
                >
                  {header?.menu?.support} <ChevronDown size={14} />
                </button>
                <ul
                  className={`${styles.dropdownMenu} ${
                    activeDropdown === "support" ? styles.dropdownOpen : ""
                  }`}
                >
                  <li><a onClick={() => handleNavClick("#")}>{header?.support?.faq}</a></li>
                  <li><a onClick={() => handleNavClick("#")}>{header?.support?.contact}</a></li>
                  <li><a onClick={() => handleNavClick("#")}>{header?.support?.referral}</a></li>
                  <li><a onClick={() => handleNavClick("#")}>{header?.support?.account}</a></li>
                </ul>
              </li>
            </ul>
            {/* Overlay când meniul mobil e deschis */}
            {open && <div className={styles.overlay} onClick={() => setOpen(false)}></div>}

            {/* Language Selector */}
            <div className={styles.langWrapper}>
              <button
                onClick={() => {
                  if (!loggedIn) {
                    setShowUserModal(true); 
                    return;
                  }
                  setShowLangMenu((prev) => !prev);
                }}
                className={styles.langIcon}
                aria-label={header?.aria?.selectLanguage}
              >
                <Globe size={24} />
                <span className={styles.langCode}>{language.toUpperCase()}</span>
                <ChevronDown size={14} />
              </button>

              <ul
                className={`${styles.langDropdown} ${
                  loggedIn && showLangMenu ? styles.dropdownOpen : ""
                }`}
                style={{ display: loggedIn ? "" : "none" }} // 👈 ascunde complet dacă nu e logat
              >
                {availableLanguages.map((lang) => (
                  <li key={lang.code}>
                    <button
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                    >
                      {lang.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Toggle Sound */}
            <button
              onClick={() => setSoundOn((prev) => !prev)}
              className={styles.soundIcon}
              aria-label={header?.aria?.toggleSound}
            >
              {soundOn ? <Volume2 /> : <VolumeX />}
            </button>

            {/* Login Icon */}
            <Link href="/user" className={styles.loginIcon}>
              <div
                style={
                  loggedIn
                    ? {
                        background: "orange",
                        borderRadius: "100%",
                        color: "black",
                        width: "25px",
                        height: "25px",
                        textAlign: "center",
                      }
                    : {}
                }
              >
                <User size={22} />
              </div>
            </Link>
          </div>

          {/* Hamburger (mobil) */}
          <button
            className={styles.hamburger}
            onClick={() => setOpen(!open)}
            aria-label={header?.aria?.toggleMenu}
          >
            {open ? <X size={32} /> : <Menu size={32} />}
          </button>

        </div>

        {/* 👇 Modal User */}
        <UserModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} />


      </nav>
    </div>
  );
}
