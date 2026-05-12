"use client";

import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={`${styles.nav} glass-card`}>
      <Link href="/" className={styles.brand}>
        CloudProject
      </Link>
      <div className={styles.links}>
        <Link href="/assignments/lab-1/plagiarism">Assignments</Link>
        <Link href="/assignments/lab-1/plagiarism">Plagiarism</Link>
        <Link href="/assignments/lab-1/plagiarism/stu-045-stu-067">Diffs</Link>
      </div>
      <div className={styles.status}>Instructor View</div>
    </nav>
  );
}
