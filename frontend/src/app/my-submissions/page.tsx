'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Eye, Upload, User } from 'lucide-react';
import '@/styles/plagiarism.css';

const ParticleBackground = dynamic(() => import('@/components/shared/ThreeBackground'), {
  ssr: false,
});

interface Submission {
  id: string;
  assignment: string;
  files: string;
  submitted: string;
  status: 'uploaded' | 'analyzing' | 'completed';
  aiScore?: number;
}

const mockSubmissions: Submission[] = [
  {
    id: 'SUB-001',
    assignment: 'Lab 1: Basics',
    files: '3 files',
    submitted: '2 hours ago',
    status: 'completed',
    aiScore: 87
  },
  {
    id: 'SUB-002',
    assignment: 'Lab 2: Advanced',
    files: '2 files',
    submitted: '1 day ago',
    status: 'analyzing'
  },
  {
    id: 'SUB-003',
    assignment: 'Project: Authentication',
    files: '5 files',
    submitted: '3 days ago',
    status: 'completed',
    aiScore: 92
  },
  {
    id: 'SUB-004',
    assignment: 'Lab 3: Data Structures',
    files: '4 files',
    submitted: '1 week ago',
    status: 'uploaded'
  },
];

export default function MySubmissionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [studentId] = useState('STU-2024-001');

  React.useEffect(() => {
    setMounted(true);
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
            <div className="flex items-center gap-4">
              <span className="filter-tab-badge" style={{ backgroundColor: 'rgba(200,168,75,0.15)', borderColor: 'rgba(200,168,75,0.6)', color: '#c8a84b' }}>
                <User size={12} className="mr-1" />
                {studentId}
              </span>
            </div>
          </div>
        </nav>

        <div className="flex-1 flex flex-col overflow-hidden p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="section-label mb-4">MY SUBMISSIONS</div>
            <h2 className="text-3xl font-bold font-syne text-white">Your submission history</h2>
          </div>

          {/* Submissions Table */}
          {mockSubmissions.length > 0 ? (
            <div className="card-glassmorphism rounded-xl p-6 flex-1 overflow-hidden">
              <div className="overflow-y-auto h-full scrollbar-hide">
                <table className="w-full">
                  <thead className="sticky top-0 bg-black/20">
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-3 text-left section-label">Assignment</th>
                      <th className="px-6 py-3 text-left section-label">Files</th>
                      <th className="px-6 py-3 text-left section-label">Submitted</th>
                      <th className="px-6 py-3 text-left section-label">Status</th>
                      <th className="px-6 py-3 text-left section-label">AI Score</th>
                      <th className="px-6 py-3 text-left section-label">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSubmissions.map((submission) => {
                      const statusColor = getStatusColor(submission.status);
                      return (
                        <tr key={submission.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-white/80">{submission.assignment}</td>
                          <td className="px-6 py-4 text-white/60 font-jetbrains">{submission.files}</td>
                          <td className="px-6 py-4 text-white/60 font-jetbrains">{submission.submitted}</td>
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
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#c8a84b]/20 flex items-center justify-center">
                  <Upload size={32} className="text-[#c8a84b]" />
                </div>
                <h3 className="text-xl font-bold font-syne text-white mb-3">No submissions yet</h3>
                <p className="text-white/60 mb-6">Start by uploading your code.</p>
                <Link href="/submit" className="ghost-button-new">
                  <Upload size={16} />
                  <span className="text-sm font-semibold">Upload Now</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
