import styles from "./pair.module.css";

const leftStudent = "STU-2024-045";
const rightStudent = "STU-2024-067";
const fallbackPairLabel = "STU-045 vs STU-067";

const formatPairLabel = (pairId?: string) => {
  if (!pairId) {
    return fallbackPairLabel;
  }

  const normalized = pairId.replace(/_/g, "-");
  const parts = normalized.split("-");
  if (parts.length >= 4) {
    const left = `${parts[0]}-${parts[1]}`.toUpperCase();
    const right = `${parts[2]}-${parts[3]}`.toUpperCase();
    return `${left} vs ${right}`;
  }

  if (normalized.includes("vs")) {
    return normalized.replace(/-/g, " ").toUpperCase();
  }

  return normalized.toUpperCase();
};

const leftCode = [
  { line: 1, text: "def tokenize_source(source: str) -> list[str]:", match: true },
  { line: 2, text: "    tokens = []", match: true },
  { line: 3, text: "    for value in source.split():", match: true },
  { line: 4, text: "        tokens.append(value.lower())", match: true },
  { line: 5, text: "    return tokens", match: true },
  { line: 6, text: "", match: false },
  { line: 7, text: "def cosine_similarity(a, b):", match: false },
  { line: 8, text: "    dot = sum(x * y for x, y in zip(a, b))", match: true },
  { line: 9, text: "    norm = (sum(x * x for x in a) ** 0.5)", match: true },
  { line: 10, text: "    return dot / (norm * (sum(y*y for y in b) ** 0.5))", match: true },
];

const rightCode = [
  { line: 1, text: "def tokenize_source(source: str) -> list[str]:", match: true },
  { line: 2, text: "    parts = []", match: true },
  { line: 3, text: "    for value in source.split():", match: true },
  { line: 4, text: "        parts.append(value.lower())", match: true },
  { line: 5, text: "    return parts", match: true },
  { line: 6, text: "", match: false },
  { line: 7, text: "def cosine_similarity(a, b):", match: false },
  { line: 8, text: "    dot = sum(x * y for x, y in zip(a, b))", match: true },
  { line: 9, text: "    magnitude = (sum(x * x for x in a) ** 0.5)", match: true },
  { line: 10, text: "    return dot / (magnitude * (sum(y*y for y in b) ** 0.5))", match: true },
];

export default async function PairDiff({
  params,
}: {
  params: Promise<{ id: string; pairId: string }>;
}) {
  const { pairId } = await params;
  const pairLabel = formatPairLabel(pairId);
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <span>Assignments</span>
          <span>→</span>
          <span>Lab 1: Basics</span>
          <span>→</span>
          <span>Plagiarism Report</span>
          <span>→</span>
          <span>{pairLabel}</span>
        </div>
        <div className={styles.headerRow}>
          <div className={styles.titleRow}>
            <span className="label">Similarity Score</span>
            <div className={styles.scoreBadge}>92%</div>
          </div>
          <button className="ghost-button danger-ghost">Flag for Review</button>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={`${styles.statCard} glass-card`}>
          <span className={styles.statLabel}>Files Matched</span>
          <span className={styles.statValue}>3</span>
        </div>
        <div className={`${styles.statCard} glass-card`}>
          <span className={styles.statLabel}>Matching Blocks</span>
          <span className={styles.statValue}>14</span>
        </div>
        <div className={`${styles.statCard} glass-card`}>
          <span className={styles.statLabel}>Similarity Score</span>
          <span className={styles.statValue}>92%</span>
        </div>
      </div>

      <div className={`${styles.diffCard} glass-card`}>
        <div className={styles.diffHeader}>
          <div className={styles.sectionLabel}>Side by Side Diff</div>
          <span className={styles.diffHint}>Highlighted blocks indicate matching sections</span>
        </div>
        <div className={styles.diffColumns}>
          <div className={styles.codeColumn}>
            <div className={styles.codeHeader}>
              <span className={styles.codeTitle}>{leftStudent}</span>
              <select className={styles.dropdown}>
                <option>analysis.py</option>
                <option>helpers.py</option>
                <option>vectors.py</option>
              </select>
            </div>
            <div className={styles.codeBody}>
              {leftCode.map((line) => (
                <div
                  key={line.line}
                  className={`${styles.codeLine} ${
                    line.match ? styles.matchLine : ""
                  }`}
                >
                  <span className={styles.lineNumber}>{line.line}</span>
                  <span className={styles.lineText}>{line.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.divider} />
          <div className={styles.codeColumn}>
            <div className={styles.codeHeader}>
              <span className={styles.codeTitle}>{rightStudent}</span>
              <select className={styles.dropdown}>
                <option>analysis.py</option>
                <option>helpers.py</option>
                <option>vectors.py</option>
              </select>
            </div>
            <div className={styles.codeBody}>
              {rightCode.map((line) => (
                <div
                  key={line.line}
                  className={`${styles.codeLine} ${
                    line.match ? styles.matchLine : ""
                  }`}
                >
                  <span className={styles.lineNumber}>{line.line}</span>
                  <span className={styles.lineText}>{line.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
