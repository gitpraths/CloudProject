"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const params = useParams<{ id?: string; pairId?: string }>();
  const assignmentId = typeof params?.id === "string" ? params.id : "lab-1";
  const pairId =
    typeof params?.pairId === "string" ? params.pairId : "stu-045-stu-067";

  const plagiarismHref = `/assignments/${assignmentId}/plagiarism`;
  const diffHref = `${plagiarismHref}/${pairId}`;

  return (
    <nav className={`${styles.nav} glass-card`}>
      <Link href="/" className={styles.brand}>
        CloudProject
      </Link>
      <div className={styles.links}>
        <Link href="/">Assignments</Link>
        <Link href={plagiarismHref}>Plagiarism</Link>
        <Link href={diffHref}>Diffs</Link>
      </div>
      <div className={styles.status}>Instructor View</div>
    </nav>
  );
}
