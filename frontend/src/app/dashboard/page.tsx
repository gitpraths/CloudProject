"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/ui/button";
import { MoreVertical, Eye, FileCode2, ClipboardList, AlertTriangle } from "lucide-react";

const ParticleBackground = dynamic(
  () => import("@/components/shared/ThreeBackground"),
  { ssr: false }
);

// Mock data
const mockStats = [
  { label: "Total Submissions", value: "1,247", icon: FileCode2 },
  { label: "Assignments Active", value: "12", icon: ClipboardList },
  { label: "Flagged Pairs", value: "43", icon: AlertTriangle }
];

const mockSubmissions = [
  { id: "SUB-001", student: "STU-2024-001", assignment: "Lab 1: Basics", status: "analyzed", created: "2 hours ago" },
  { id: "SUB-002", student: "STU-2024-015", assignment: "Project: Authentication", status: "analyzing", created: "15 min ago" },
  { id: "SUB-003", student: "STU-2024-042", assignment: "Lab 2: Advanced", status: "uploaded", created: "1 hour ago" },
  { id: "SUB-004", student: "STU-2024-089", assignment: "Midterm Review", status: "analyzed", created: "4 hours ago" },
  { id: "SUB-005", student: "STU-2024-103", assignment: "Lab 1: Basics", status: "failed", created: "30 min ago" },
  { id: "SUB-006", student: "STU-2024-156", assignment: "Project: Authentication", status: "analyzed", created: "3 hours ago" }
];

const mockFlaggedPairs = [
  { pair: ["STU-2024-045", "STU-2024-067"], similarity: 0.92, assignment: "Lab 3: Data Structures" },
  { pair: ["STU-2024-089", "STU-2024-112"], similarity: 0.78, assignment: "Project: API Design" },
  { pair: ["STU-2024-023", "STU-2024-091"], similarity: 0.65, assignment: "Lab 2: Advanced" },
  { pair: ["STU-2024-156", "STU-2024-203"], similarity: 0.88, assignment: "Midterm Review" },
  { pair: ["STU-2024-001", "STU-2024-034"], similarity: 0.54, assignment: "Lab 1: Basics" }
];

const getStatusBadge = (status: string) => {
  const styles: Record<string, { border: string; text: string }> = {
    uploaded: { border: "border-gray-500/50", text: "text-gray-400" },
    analyzing: { border: "border-amber-500/50", text: "text-amber-400" },
    analyzed: { border: "border-green-500/50", text: "text-green-400" },
    failed: { border: "border-red-500/50", text: "text-red-400" }
  };
  const style = styles[status] || styles.uploaded;
  return `${style.border} ${style.text}`;
};

const getSimilarityColor = (score: number) => {
  if (score > 0.8) return { bar: "bg-red-600", glow: "rgba(220, 38, 38, 0.4)" };
  if (score > 0.6) return { bar: "bg-amber-600", glow: "rgba(217, 119, 6, 0.4)" };
  return { bar: "bg-green-600", glow: "rgba(22, 163, 74, 0.4)" };
};

const getSimilarityLabel = (score: number) => {
  if (score > 0.8) return "text-red-400";
  if (score > 0.6) return "text-amber-400";
  return "text-green-400";
};

export default function DashboardPage() {
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);

  return (
    <main className="h-screen bg-transparent overflow-hidden flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-jetbrains { font-family: 'JetBrains Mono', monospace; }
        
        .stat-card {
          background: rgba(15, 15, 20, 0.45);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(180, 160, 80, 0.15);
          border-top: 2px solid #c8a84b;
          box-shadow: 0 -4px 20px rgba(200, 168, 75, 0.15);
        }
        
        .stat-card:hover {
          box-shadow: 0 -4px 25px rgba(200, 168, 75, 0.25), 0 0 16px rgba(200, 168, 75, 0.12);
        }
        
        .card-glassmorphism {
          background: rgba(15, 15, 20, 0.45);
          backdrop-filter: blur(8px);
        }
        
        .stat-value {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          background: linear-gradient(to right, #c8a84b, #d4b860);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .section-label {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .table-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-family: 'JetBrains Mono', monospace;
        }
        
        .table-row:hover {
          background-color: rgba(200, 168, 75, 0.05);
        }
        
        .status-badge {
          font-size: 0.75rem;
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          border: 1px solid;
          background: transparent;
          text-transform: capitalize;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
        }
        
        .similarity-bar {
          position: relative;
          height: 8px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 9999px;
          border: 1px solid rgba(200, 168, 75, 0.1);
          overflow: hidden;
        }
        
        .similarity-bar-fill {
          height: 100%;
          transition: all 0.3s ease;
          border-radius: 9999px;
          filter: drop-shadow(0 0 4px currentColor);
        }
        
        .ghost-button {
          border: 1px solid rgba(200, 168, 75, 0.3);
          background: transparent;
          color: #c8a84b;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        
        .ghost-button:hover {
          background: rgba(200, 168, 75, 0.1);
          border-color: rgba(200, 168, 75, 0.6);
        }
        
        .navbar-border {
          border-bottom: 1px solid rgba(200, 168, 75, 0.15);
        }
        
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <ParticleBackground opacity={0.4} particleCount={60} particleSize={0.12} lineOpacity={0.35} />

      <div className="relative z-10 flex flex-col h-full">
        {/* Navbar */}
        <nav className="navbar-border bg-transparent backdrop-blur-xl h-14 flex-shrink-0">
          <div className="px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold font-syne text-white">CodeReview AI</h1>
              <div className="flex gap-1">
                {["Dashboard", "Assignments", "Submissions"].map((item) => (
                  <button
                    key={item}
                    className={`px-4 py-2 rounded-lg text-sm font-syne font-medium transition-all ${
                      item === "Dashboard"
                        ? "bg-[#c8a84b]/20 text-[#c8a84b] border border-[#c8a84b]/30"
                        : "text-white/60 hover:text-white/80"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <button className="w-10 h-10 rounded-lg border border-white/10 bg-black/30 flex items-center justify-center text-white/60 hover:text-white">
              <MoreVertical size={20} />
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="px-6 lg:px-8 py-6 flex flex-col h-[calc(100%-56px)] bg-transparent">
          {/* Stats Row */}
          <div className="flex-shrink-0 h-32 mb-6">
            <p className="section-label mb-4">Dashboard Overview</p>
            <div className="grid sm:grid-cols-3 gap-6">
              {mockStats.map((stat) => {
                const IconComponent = stat.icon;
                return (
                  <div key={stat.label} className="stat-card p-5 rounded-2xl transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <IconComponent size={20} className="text-[#c8a84b]/60" strokeWidth={1.5} />
                    </div>
                    <div className="stat-value text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                    <p className="section-label text-xs">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Layout - Two Columns */}
          <div className="flex gap-6 flex-1 min-h-0">
            {/* Left Column - Recent Submissions (60%) */}
            <div className="flex-[1.5] flex flex-col min-h-0">
              <p className="section-label mb-4 flex-shrink-0">Recent Submissions</p>
              <div className="card-glassmorphism rounded-2xl border border-[#c8a84b]/15 overflow-hidden flex flex-col flex-1 min-h-0">
                <div className="overflow-y-auto flex-1">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-transparent">
                      <tr className="border-b border-white/5 bg-black/20">
                        <th className="px-6 py-3 text-left section-label">Student ID</th>
                        <th className="px-6 py-3 text-left section-label">Assignment</th>
                        <th className="px-6 py-3 text-left section-label">Status</th>
                        <th className="px-6 py-3 text-left section-label">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockSubmissions.slice(0, 5).map((submission) => (
                        <tr
                          key={submission.id}
                          className="table-row transition-colors cursor-pointer"
                          onClick={() => setSelectedSubmission(submission.id)}
                        >
                          <td className="px-6 py-3 text-sm text-white font-jetbrains font-medium">{submission.student}</td>
                          <td className="px-6 py-3 text-sm text-white/80 font-syne">{submission.assignment}</td>
                          <td className="px-6 py-3">
                            <span className={`status-badge ${getStatusBadge(submission.status)}`}>
                              {submission.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-xs text-white/60 font-jetbrains">{submission.created}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Empty state footer */}
                <div className="px-6 py-8 border-t border-white/5 text-center flex-shrink-0">
                  <p className="text-xs text-white/30 font-jetbrains">
                    <span className="inline-block border-t border-dashed border-white/20 w-12 mr-2"></span>
                    No further submissions
                    <span className="inline-block border-t border-dashed border-white/20 w-12 ml-2"></span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Top Flagged Pairs (40%) */}
            <div className="flex-1 flex flex-col min-h-0">
              <p className="section-label mb-4 flex-shrink-0">Top Flagged Pairs</p>
              <div className="card-glassmorphism rounded-2xl border border-[#c8a84b]/15 overflow-hidden flex flex-col flex-1 min-h-0">
                <div className="divide-y divide-white/5 overflow-y-auto flex-1 scrollbar-hide">
                  {mockFlaggedPairs.slice(0, 3).map((pair, idx) => {
                    const similarity = getSimilarityColor(pair.similarity);
                    return (
                      <div key={idx} className="p-4 hover:bg-white/5 transition-colors flex-shrink-0">
                        <div className="mb-3">
                          <div className="text-xs text-white/60 mb-2 font-jetbrains">
                            <span className="text-[#c8a84b]">{pair.pair[0]}</span>
                            <span className="mx-2 text-white/40">↔</span>
                            <span className="text-[#c8a84b]">{pair.pair[1]}</span>
                          </div>
                          <div className="text-xs text-white/50 font-syne">{pair.assignment}</div>
                        </div>

                        {/* Similarity Score and Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-bold font-jetbrains ${getSimilarityLabel(pair.similarity)}`}>
                              {(pair.similarity * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="similarity-bar">
                            <div
                              className={`similarity-bar-fill ${similarity.bar}`}
                              style={{
                                width: `${pair.similarity * 100}%`,
                                boxShadow: `0 0 8px ${similarity.glow}`
                              }}
                            />
                          </div>
                        </div>

                        <button className="ghost-button w-full">
                          <Eye size={12} /> Review
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
