import Link from "next/link";

export default function Home() {
  return (
    <div className="home-hero">
      <div className="glass-card home-card">
        <div className="label">CloudProject Dashboard</div>
        <h1 className="home-title">Plagiarism &amp; Review Analytics</h1>
        <p className="home-subtitle">
          Launch the latest plagiarism report experience and explore flagged
          similarity pairs.
        </p>
        <Link
          className="ghost-button home-button"
          href="/assignments/lab-1/plagiarism"
        >
          Open Report
        </Link>
      </div>
    </div>
  );
}
