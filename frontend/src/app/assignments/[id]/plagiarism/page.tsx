import Link from "next/link";
import styles from "./plagiarism.module.css";

const students = [
  "STU-001",
  "STU-002",
  "STU-003",
  "STU-004",
  "STU-005",
  "STU-006",
  "STU-007",
  "STU-008",
];

const similarityMatrix: Array<Array<number | null>> = [
  [null, 92, 68, 44, 58, 85, 39, 61],
  [92, null, 73, 52, 64, 81, 45, 56],
  [68, 73, null, 59, 62, 78, 34, 48],
  [44, 52, 59, null, 57, 66, 41, 63],
  [58, 64, 62, 57, null, 88, 49, 72],
  [85, 81, 78, 66, 88, null, 53, 69],
  [39, 45, 34, 41, 49, 53, null, 55],
  [61, 56, 48, 63, 72, 69, 55, null],
];

const flaggedPairs = [
  {
    id: "stu-001-stu-006",
    studentA: "STU-001",
    studentB: "STU-006",
    similarity: 92,
    filesMatched: 4,
  },
  {
    id: "stu-002-stu-003",
    studentA: "STU-002",
    studentB: "STU-003",
    similarity: 84,
    filesMatched: 3,
  },
  {
    id: "stu-005-stu-006",
    studentA: "STU-005",
    studentB: "STU-006",
    similarity: 88,
    filesMatched: 5,
  },
  {
    id: "stu-004-stu-008",
    studentA: "STU-004",
    studentB: "STU-008",
    similarity: 81,
    filesMatched: 2,
  },
  {
    id: "stu-002-stu-005",
    studentA: "STU-002",
    studentB: "STU-005",
    similarity: 80,
    filesMatched: 2,
  },
];

const assignmentName = "Lab 1: Basics";

const getCellColor = (score: number | null) => {
  if (score === null) {
    return "rgba(255, 255, 255, 0.05)";
  }
  if (score > 80) {
    return "rgba(220, 50, 50, 0.7)";
  }
  if (score >= 60) {
    return "rgba(220, 150, 0, 0.7)";
  }
  return "rgba(30, 180, 80, 0.15)";
};

export default function PlagiarismReport({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <span>Assignments</span>
          <span>→</span>
          <span>{assignmentName}</span>
          <span>→</span>
          <span>Plagiarism Report</span>
        </div>
        <div className={styles.headerRow}>
          <div>
            <div className="label">Plagiarism Report</div>
            <div className={styles.assignmentName}>{assignmentName}</div>
          </div>
          <button className="ghost-button">Export Report</button>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={`${styles.statCard} glass-card`}>
          <span className={styles.statLabel}>Total Pairs Analyzed</span>
          <span className={styles.statValue}>276</span>
        </div>
        <div className={`${styles.statCard} glass-card`}>
          <span className={styles.statLabel}>Flagged Pairs</span>
          <span className={styles.statValue}>8</span>
        </div>
        <div className={`${styles.statCard} glass-card`}>
          <span className={styles.statLabel}>Highest Similarity</span>
          <span className={styles.statValue}>92%</span>
        </div>
      </div>

      <div className={`${styles.matrixCard} glass-card`}>
        <div className={styles.sectionLabel}>Similarity Matrix</div>
        <div className={styles.matrixGrid}>
          <div />
          {students.map((student) => (
            <div key={`col-${student}`} className={styles.matrixHeader}>
              {student}
            </div>
          ))}
          {students.map((student, rowIndex) => (
            <div key={`row-${student}`} className={styles.matrixRow}>
              <div className={styles.matrixRowLabel}>{student}</div>
              {similarityMatrix[rowIndex].map((score, colIndex) => {
                const isSelf = score === null;
                const isFlagged = score !== null && score > 80;
                const pairId = `${students[rowIndex].toLowerCase()}-${students[
                  colIndex
                ].toLowerCase()}`;
                const cellClassName = `${styles.cell} ${
                  isFlagged ? styles.flagged : ""
                } ${isSelf ? styles.selfCell : ""}`;
                const content = isSelf ? "—" : `${score}%`;
                const cell = (
                  <div
                    className={cellClassName}
                    style={{ background: getCellColor(score) }}
                  >
                    {content}
                    {!isSelf && (
                      <span className={styles.tooltip}>{score}% similarity</span>
                    )}
                  </div>
                );

                return isFlagged ? (
                  <Link
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={styles.linkCell}
                    href={`/assignments/${params.id}/plagiarism/${pairId}`}
                  >
                    {cell}
                  </Link>
                ) : (
                  <div key={`cell-${rowIndex}-${colIndex}`} className={styles.linkCell}>
                    {cell}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.tableCard} glass-card`}>
        <div className={styles.sectionLabel}>Flagged Pairs</div>
        <div className={styles.tableHeader}>
          <span>Student A</span>
          <span>Student B</span>
          <span>Similarity</span>
          <span>Files Matched</span>
          <span>Action</span>
        </div>
        {flaggedPairs.map((pair) => {
          const badgeColor = getCellColor(pair.similarity);
          return (
            <div key={pair.id} className={styles.tableRow}>
              <span className={styles.monoText}>{pair.studentA}</span>
              <span className={styles.monoText}>{pair.studentB}</span>
              <span className={styles.badge} style={{ background: badgeColor }}>
                {pair.similarity}%
              </span>
              <span>{pair.filesMatched}</span>
              <Link
                className={`${styles.actionButton} ghost-button`}
                href={`/assignments/${params.id}/plagiarism/${pair.id}`}
              >
                View Diff
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
