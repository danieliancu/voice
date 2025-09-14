// components/PremiumModal.js
import styles from "../styles/Premium.module.css";

export default function PremiumModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✖
        </button>

        <div className={`${styles.plan} ${styles.featured}`}>
          <h2 className={styles.planName}>Premium</h2>
          <p className={styles.price}>
            £10 <span>/month</span>
          </p>
          <button className={`${styles.btn} ${styles.btnPrimary}`}>
            Buy plan
          </button>
          <ul className={styles.features}>
            <li><span className={styles.check}>✔</span> Unlimited languages</li>
            <li><span className={styles.check}>✔</span> Unlimited messages</li>
            <li><span className={styles.check}>✔</span> Advanced dashboard</li>
            <li><span className={styles.check}>✔</span> Grammar & vocab feedback</li>
            <li><span className={styles.check}>✔</span> Adaptive AI mode</li>
            <li><span className={styles.check}>✔</span> Quizzes & exercises</li>
            <li><span className={styles.check}>✔</span> Progress reports (PDF)</li>
            <li><span className={styles.check}>✔</span> Badges & certificates</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
