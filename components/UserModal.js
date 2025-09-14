// components/UserModal.js
import { useRouter } from "next/router";
import styles from "../styles/Premium.module.css";

export default function UserModal({ isOpen, onClose }) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleRegister = () => {
    onClose(); // închidem modalul
    router.push("/user"); // redirecționăm către pagina /user
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✖
        </button>

        <div className={styles.plan}>
          <h2 className={styles.planName}>User</h2>
          <p className={styles.price}>Free</p>
          <button
            className={styles.btn}
            onClick={handleRegister}
          >
            Register
          </button>
          <ul className={styles.features}>
            <li><span className={styles.check}>✔</span> Multiple languages</li>
            <li><span className={styles.check}>✔</span> Conversation history</li>
            <li><span className={styles.check}>✔</span> Progress dashboard</li>
            <li><span className={styles.check}>✔</span> Demo lessons</li>
            <li>— No advanced feedback</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
