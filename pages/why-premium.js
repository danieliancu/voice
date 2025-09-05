import styles from "../styles/Premium.module.css";
import Footer from "@/components/Footer";

export default function WhyPremium() {
  return (
    <div className={styles.premiumContainer}>
      <h1 className={styles.title}>Why go Premium?</h1>
      <p className={styles.subtitle}>
        Compare what you get as a Guest, a Free Registered User, and a Premium
        subscriber. Choose the plan that best fits your learning journey.
      </p>

      <div className={styles.plans}>
        {/* Guest */}
        <div className={styles.plan}>
          <h2 className={styles.planName}>Guest</h2>
          <p className={styles.price}>Free</p>
          <button className={styles.btn}>Start now</button>
          <ul className={styles.features}>
            <li><span className={styles.check}>✔</span> Limited access</li>
            <li><span className={styles.check}>✔</span> Default English only</li>
            <li><span className={styles.check}>✔</span> 5–10 messages/day</li>
            <li><span className={styles.check}>✔</span> Basic feedback</li>
            <li>— No progress saved</li>
          </ul>
        </div>

        {/* User */}
        <div className={styles.plan}>
          <h2 className={styles.planName}>User</h2>
          <p className={styles.price}>Free</p>
          <button className={styles.btn}>Register</button>
          <ul className={styles.features}>
            <li><span className={styles.check}>✔</span> Multiple languages</li>
            <li><span className={styles.check}>✔</span> Conversation history</li>
            <li><span className={styles.check}>✔</span> Progress dashboard</li>
            <li><span className={styles.check}>✔</span> Demo lessons</li>
            <li>— No advanced feedback</li>
          </ul>
        </div>

        {/* Premium */}
        <div className={`${styles.plan} ${styles.featured}`}>
          <h2 className={styles.planName}>Premium</h2>
          <p className={styles.price}>£10 <span>/month</span></p>
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
      <Footer />
    </div>
  );
}
