'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Calendar, Play, MoreVertical } from 'lucide-react';

const ParticleBackground = dynamic(() => import('@/components/shared/ThreeBackground'), {
  ssr: false,
});

type FilterType = 'all' | 'active' | 'analyzing' | 'closed';
type StatusType = 'active' | 'analyzing' | 'closed';

interface Assignment {
  id: string;
  name: string;
  status: StatusType;
  submissions: number;
  flagged: number;
  deadline: string;
  avgScore: number;
}

const mockAssignments: Assignment[] = [
  {
    id: 'lab1',
    name: 'Lab 1: Basics',
    status: 'active',
    submissions: 24,
    flagged: 3,
    deadline: 'May 20',
    avgScore: 87,
  },
  {
    id: 'lab2',
    name: 'Lab 2: Advanced',
    status: 'analyzing',
    submissions: 18,
    flagged: 7,
    deadline: 'May 22',
    avgScore: 82,
  },
  {
    id: 'project1',
    name: 'Project: Authentication',
    status: 'active',
    submissions: 31,
    flagged: 12,
    deadline: 'May 25',
    avgScore: 79,
  },
  {
    id: 'midterm',
    name: 'Midterm Review',
    status: 'closed',
    submissions: 45,
    flagged: 8,
    deadline: 'Apr 30',
    avgScore: 84,
  },
  {
    id: 'lab3',
    name: 'Lab 3: Data Structures',
    status: 'closed',
    submissions: 22,
    flagged: 5,
    deadline: 'Apr 15',
    avgScore: 85,
  },
  {
    id: 'project2',
    name: 'Project: API Design',
    status: 'active',
    submissions: 15,
    flagged: 2,
    deadline: 'Jun 1',
    avgScore: 88,
  },
];

export default function AssignmentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [filter, setFilter] = useState<FilterType>('all');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const filteredAssignments = mockAssignments.filter(
    (assignment) => filter === 'all' || assignment.status === filter
  );

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'active':
        return { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)', text: '#22c55e' };
      case 'analyzing':
        return { bg: 'rgba(251, 146, 60, 0.15)', border: 'rgba(251, 146, 60, 0.4)', text: '#fb923c' };
      case 'closed':
        return { bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.4)', text: '#6b7280' };
    }
  };

  const handleViewSubmissions = (assignmentId: string) => {
    router.push(`/assignments/${assignmentId}`);
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-transparent" suppressHydrationWarning>
      <ParticleBackground
        {...({
          opacity: 0.8,
          particleCount: 78,
          particleSize: 0.2,
          lineOpacity: 0.35,
          particleColor: "rgba(200, 168, 75, 0.95)",
          particleOpacity: 0.95,
          lineColor: "rgba(200, 168, 75, 0.35)",
          ambientLightIntensity: 0.1,
          pointLight1Intensity: 0,
          pointLight2Intensity: 0,
        } as any)}
      />
      <div className="relative z-10 h-full flex flex-col">
        {/* Navbar */}
        <nav className="navbar-border bg-transparent backdrop-blur-sm h-14 flex-shrink-0 border-b border-white/5">
          <div className="px-8 h-full flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold font-syne text-white">CodeReview AI</h1>
              <div className="flex gap-1">
                {[
                  { label: "Dashboard", path: "/dashboard" },
                  { label: "Assignments", path: "/assignments" },
                  { label: "Submissions", path: "/submissions" }
                ].map(({ label, path }) => (
                  <button
                    key={label}
                    onClick={() => router.push(path)}
                    suppressHydrationWarning
                    className={`px-4 py-2 rounded-lg text-sm font-syne font-medium transition-all cursor-pointer ${
                      mounted && pathname === path
                        ? "bg-[#c8a84b]/20 text-[#c8a84b] border border-[#c8a84b]/30"
                        : "text-white/60 hover:text-white/80"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white">
              <MoreVertical size={20} />
            </button>
          </div>
        </nav>

        <div className="flex-1 flex flex-col overflow-hidden p-8">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-8 flex-shrink-0">
            <h1 className="section-label">ASSIGNMENTS</h1>
            <button className="ghost-button-new">
              <span className="text-sm font-semibold">New Assignment</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-8 flex-shrink-0">
            {(['all', 'active', 'analyzing', 'closed'] as FilterType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`filter-tab ${filter === tab ? 'filter-tab-active' : ''}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="grid">
              {filteredAssignments.map((assignment) => {
                const statusColor = getStatusColor(assignment.status);
                return (
                  <div
                    key={assignment.id}
                    className="card-glassmorphism rounded-xl p-6 flex flex-col h-fit transition-all duration-300 hover:shadow-lg"
                  >
                    {/* Header with Title and Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-syne font-bold text-white leading-tight flex-1 pr-3">
                        {assignment.name}
                      </h3>
                      <span
                        className="filter-tab-badge"
                        style={{
                          borderColor: statusColor.border,
                          color: statusColor.text,
                        }}
                      >
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </span>
                    </div>

                    {/* Mini Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div>
                        <div className="text-xs text-white/50 font-syne mb-1">Submissions</div>
                        <div className="text-lg font-bold text-[#e0b84e]">{assignment.submissions}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/50 font-syne mb-1">Flagged</div>
                        <div className="text-lg font-bold text-[#e0b84e]">{assignment.flagged}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/50 font-syne mb-1">Avg Score</div>
                        <div className="text-lg font-bold text-[#e0b84e]">{assignment.avgScore}%</div>
                      </div>
                    </div>

                    {/* Deadline */}
                    <div className="flex items-center gap-2 mb-6 text-xs text-white/50">
                      <Calendar size={14} />
                      <span className="font-jetbrains">{assignment.deadline}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-auto">
                      <button
                        onClick={() => handleViewSubmissions(assignment.id)}
                        className="ghost-button flex-1"
                      >
                        <span>View</span>
                      </button>
                      <button className="ghost-button flex-1">
                        <Play size={12} />
                        <span>Analyze</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

        .font-syne { font-family: 'Syne', sans-serif; }
        .font-jetbrains { font-family: 'JetBrains Mono', monospace; }

        .section-label {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .card-glassmorphism {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(200, 168, 75, 0.6);
          box-shadow: 0 0 12px rgba(200, 168, 75, 0.15), 0 0 30px rgba(200, 168, 75, 0.08),
            inset 0 0 20px rgba(200, 168, 75, 0.03);
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .card-glassmorphism:hover {
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(200, 168, 75, 0.9);
          box-shadow: 0 0 20px rgba(200, 168, 75, 0.3), 0 0 60px rgba(200, 168, 75, 0.12),
            inset 0 0 30px rgba(200, 168, 75, 0.05);
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          width: 100%;
          align-content: start;
        }

        .ghost-button-new {
          border: 1px solid rgba(200, 168, 75, 0.6);
          background: transparent;
          color: #c8a84b;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.5rem 1.25rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          cursor: pointer;
        }

        .ghost-button-new:hover {
          background: rgba(200, 168, 75, 0.1);
          border-color: rgba(200, 168, 75, 0.9);
        }

        .filter-tab {
          padding: 0.5rem 1rem;
          border: 1px solid rgba(200, 168, 75, 0.3);
          background: transparent;
          color: rgba(255, 255, 255, 0.6);
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'JetBrains Mono', monospace;
        }

        .filter-tab:hover {
          border-color: rgba(200, 168, 75, 0.6);
          color: rgba(255, 255, 255, 0.8);
        }

        .filter-tab-active {
          background: rgba(200, 168, 75, 0.15);
          border-color: rgba(200, 168, 75, 0.9);
          color: #e0b84e;
        }

        .filter-tab-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          border: 1px solid;
          background: transparent;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
        }

        .ghost-button {
          border: 1px solid rgba(200, 168, 75, 0.3);
          background: transparent;
          color: #c8a84b;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          cursor: pointer;
        }

        .ghost-button:hover {
          background: rgba(200, 168, 75, 0.1);
          border-color: rgba(200, 168, 75, 0.6);
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .navbar-border {
          border-bottom: 1px solid rgba(200, 168, 75, 0.3);
          box-shadow: 0 1px 20px rgba(200, 168, 75, 0.1);
        }
      `}</style>
    </main>
  );
}
