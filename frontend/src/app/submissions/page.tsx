'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Eye, Upload, FileCode2, TrendingUp, AlertTriangle } from 'lucide-react';
import '@/styles/plagiarism.css';
import { getUploadedFiles } from '@/lib/api';

const ParticleBackground = dynamic(() => import('@/components/shared/ThreeBackground'), {
  ssr: false,
});

interface Submission {
  id: string;
  studentId: string;
  assignment: string;
  status: 'uploaded' | 'analyzing' | 'completed';
  submitted: string;
  aiScore?: number;
}

const mockSubmissions: Submission[] = [
  {
    id: 'SUB-001',
    studentId: 'STU-2024-001',
    assignment: 'Lab 1: Basics',
    status: 'completed',
    submitted: '2 hours ago',
    aiScore: 87
  },
  {
    id: 'SUB-002',
    studentId: 'STU-2024-015',
    assignment: 'Project: Authentication',
    status: 'analyzing',
    submitted: '15 min ago',
    aiScore: 92
  },
  {
    id: 'SUB-003',
    studentId: 'STU-2024-042',
    assignment: 'Lab 2: Advanced',
    status: 'uploaded',
    submitted: '1 hour ago',
    aiScore: 78
  },
  {
    id: 'SUB-004',
    studentId: 'STU-2024-089',
    assignment: 'Midterm Review',
    status: 'completed',
    submitted: '4 hours ago',
    aiScore: 85
  },
  {
    id: 'SUB-005',
    studentId: 'STU-2024-103',
    assignment: 'Lab 1: Basics',
    status: 'analyzing',
    submitted: '30 min ago',
    aiScore: 91
  },
  {
    id: 'SUB-006',
    studentId: 'STU-2024-156',
    assignment: 'Project: Authentication',
    status: 'completed',
    submitted: '3 hours ago',
    aiScore: 88
  },
];

export default function SubmissionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [filter, setFilter] = useState<'all' | 'uploaded' | 'analyzing' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const files = await getUploadedFiles();
        // Update mockSubmissions with real data
        console.log('Fetched files:', files);
      } catch (error) {
        console.error('Failed to fetch files:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded':
        return { bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.4)', text: '#6b7280' };
      case 'analyzing':
        return { bg: 'rgba(251, 146, 60, 0.15)', border: 'rgba(251, 146, 60, 0.4)', text: '#fb923c' };
      case 'completed':
        return { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)', text: '#22c55e' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.4)', text: '#6b7280' };
    }
  };

  const filteredSubmissions = mockSubmissions.filter(submission => 
    filter === 'all' || submission.status === filter
  );

  const stats = {
    total: mockSubmissions.length,
    uploaded: mockSubmissions.filter(s => s.status === 'uploaded').length,
    analyzing: mockSubmissions.filter(s => s.status === 'analyzing').length,
    completed: mockSubmissions.filter(s => s.status === 'completed').length,
    avgScore: mockSubmissions
      .filter(s => s.aiScore !== undefined)
      .reduce((sum, s) => sum + (s.aiScore || 0), 0) / 
      mockSubmissions.filter(s => s.aiScore !== undefined).length
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
                  { label: "Submissions", path: "/submissions" },
                  { label: "Submit", path: "/submit" }
                ].map(({ label, path }) => (
                  <Link
                    key={label}
                    href={path}
                    suppressHydrationWarning
                    className={`px-4 py-2 rounded-lg text-sm font-syne font-medium transition-all cursor-pointer ${
                      mounted && pathname === path
                        ? "bg-[#c8a84b]/20 text-[#c8a84b] border border-[#c8a84b]/30"
                        : "text-white/60 hover:text-white/80"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <button className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white">
              <FileCode2 size={20} />
            </button>
          </div>
        </nav>

        <div className="flex-1 flex flex-col overflow-hidden p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <div className="section-label mb-4">SUBMISSIONS OVERVIEW</div>
              <h2 className="text-3xl font-bold font-syne text-white">All Submissions</h2>
            </div>
            
            <div className="relative">
              <button className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white">
                <div className="w-6 h-6 flex flex-col justify-center">
                  <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                  <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                  <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                </div>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-[repeat(4,1fr)] gap-4 mb-4 flex-shrink-0">
            <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,168,75,0.6)', boxShadow: '0 0 12px rgba(200,168,75,0.15), 0 0 30px rgba(200,168,75,0.08), inset 0 0 20px rgba(200,168,75,0.03)' }}>
              <div className="text-xs text-white/50 font-syne mb-1">Total Submissions</div>
              <div className="text-2xl font-bold text-[#e0b84e]">{stats.total}</div>
            </div>
            <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,168,75,0.6)', boxShadow: '0 0 12px rgba(200,168,75,0.15), 0 0 30px rgba(200,168,75,0.08), inset 0 0 20px rgba(200,168,75,0.03)' }}>
              <div className="text-xs text-white/50 font-syne mb-1">Uploaded</div>
              <div className="text-2xl font-bold text-[#e0b84e]">{stats.uploaded}</div>
            </div>
            <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,168,75,0.6)', boxShadow: '0 0 12px rgba(200,168,75,0.15), 0 0 30px rgba(200,168,75,0.08), inset 0 0 20px rgba(200,168,75,0.03)' }}>
              <div className="text-xs text-white/50 font-syne mb-1">Analyzing</div>
              <div className="text-2xl font-bold text-[#e0b84e]">{stats.analyzing}</div>
            </div>
            <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,168,75,0.6)', boxShadow: '0 0 12px rgba(200,168,75,0.15), 0 0 30px rgba(200,168,75,0.08), inset 0 0 20px rgba(200,168,75,0.03)' }}>
              <div className="text-xs text-white/50 font-syne mb-1">Completed</div>
              <div className="text-2xl font-bold text-[#e0b84e]">{stats.completed}</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 flex-shrink-0">
            {(['all', 'uploaded', 'analyzing', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`filter-tab ${filter === tab ? 'filter-tab-active' : ''}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Submissions Table */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="card-glassmorphism rounded-xl p-6 h-full overflow-hidden">
              <div className="overflow-y-auto h-full scrollbar-hide">
                <table className="w-full">
                  <thead className="sticky top-0 bg-black/20">
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-3 text-left section-label">Student ID</th>
                      <th className="px-6 py-3 text-left section-label">Assignment</th>
                      <th className="px-6 py-3 text-left section-label">Status</th>
                      <th className="px-6 py-3 text-left section-label">Submitted</th>
                      <th className="px-6 py-3 text-left section-label">AI Score</th>
                      <th className="px-6 py-3 text-left section-label">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((submission) => {
                      const statusColor = getStatusColor(submission.status);
                      return (
                        <tr key={submission.id} className="table-row transition-colors">
                          <td className="px-6 py-4 text-white/80 font-jetbrains">{submission.studentId}</td>
                          <td className="px-6 py-4 text-white/80">{submission.assignment}</td>
                          <td className="px-6 py-4">
                            <span
                              className="filter-tab-badge"
                              style={{
                                backgroundColor: statusColor.bg,
                                borderColor: statusColor.border,
                                color: statusColor.text
                              }}
                            >
                              {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white/60 font-jetbrains">{submission.submitted}</td>
                          <td className="px-6 py-4">
                            {submission.status === 'uploaded' || submission.status === 'analyzing' ? (
                              <span className="text-white/40 font-jetbrains">Pending</span>
                            ) : (
                              <span className="text-[#e0b84e] font-bold font-jetbrains">{submission.aiScore}/100</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Link href={`/submissions/${submission.id}`} className="ghost-button">
                              <Eye size={12} />
                              View Review
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
