import styles from "../styles/Footer.module.css";
import { Facebook, Instagram, Github, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        {/* Logo */}
        <div className={styles.logo}>
          fix<span style={{ color: "#facc15" }}>bly</span>.com
        </div>

        {/* Mega-menu */}
        <div className={styles.links}>
          <div>
            <h4>Solutions</h4>
            <ul>
              <li><a href="#">Speaking Practice</a></li>
              <li><a href="#">Writing Practice</a></li>
              <li><a href="#">Grammar Correction</a></li>
              <li><a href="#">AI Tutor</a></li>
              <li><a href="#">Progress Tracking</a></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li><a href="#">Submit ticket</a></li>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Guides</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Contact us</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Jobs</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Referral Program</a></li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Terms of service</a></li>
              <li><a href="#">Privacy policy</a></li>
              <li><a href="#">License</a></li>
              <li><a href="#">Cookies</a></li>
              <li><a href="#">Security</a></li>
            </ul>
          </div>
        </div>
      </div>

      <hr className={styles.separator} />

      {/* Newsletter */}
      <div className={styles.newsletter}>
        <div>
          <h4>Subscribe to our newsletter</h4>
          <p>The latest news, articles, and resources, sent to your inbox weekly.</p>
        </div>
        <form className={styles.form}>
          <input type="email" placeholder="Enter your email" />
          <button type="submit">Subscribe</button>
        </form>
      </div>

      <hr className={styles.separator} />

      {/* Bottom */}
      <div className={styles.bottom}>
        <p>© 2024 Fixbly. All rights reserved.</p>
        <div className={styles.socials}>
          <a href="#"><Facebook size={20} /></a>
          <a href="#"><Instagram size={20} /></a>
          <a href="#"><Github size={20} /></a>
          <a href="#"><Youtube size={20} /></a>
        </div>
      </div>
    </footer>
  );
}
