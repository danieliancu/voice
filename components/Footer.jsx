import styles from "../styles/Footer.module.css";
import { Facebook, Instagram, Github, Youtube } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function Footer() {
  const { footer } = useLanguage();
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
            <h4>{footer?.solutionsTitle}</h4>
            <ul>
              {footer?.solutions?.map((item, i) => (
                <li key={i}><a href="#">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>{footer?.supportTitle}</h4>
            <ul>
              {footer?.support?.map((item, i) => (
                <li key={i}><a href="#">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>{footer?.companyTitle}</h4>
            <ul>
              {footer?.company?.map((item, i) => (
                <li key={i}><a href="#">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>{footer?.legalTitle}</h4>
            <ul>
              {footer?.legal?.map((item, i) => (
                <li key={i}><a href="#">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <hr className={styles.separator} />

      {/* Newsletter */}
      <div className={styles.newsletter}>
        <div>
          <h4>{footer?.newsletterTitle}</h4>
          <p>{footer?.newsletterDesc}</p>
        </div>
        <form className={styles.form}>
          <input type="email" placeholder={footer?.newsletterPlaceholder} />
          <button type="submit">{footer?.newsletterCTA}</button>
        </form>
      </div>

      <hr className={styles.separator} />

      {/* Bottom */}
      <div className={styles.bottom}>
        <p>{footer?.bottom}</p>
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
