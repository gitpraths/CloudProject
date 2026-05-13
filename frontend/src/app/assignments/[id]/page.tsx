'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Calendar, Play, MoreVertical, ChevronRight, Users, Clock, Target, TrendingUp } from 'lucide-react';
import '@/styles/plagiarism.css';

const ParticleBackground = dynamic(() => import('@/components/shared/ThreeBackground'), {
  ssr: false,
});

interface Assignment {
  id: string;
  name: string;
  status: 'active' | 'analyzing' | 'closed';
  submissions: number;
  flagged: number;
  deadline: string;
  avgScore: number;
  description?: string;
  requirements?: string[];
}

const mockAssignments: Assignment[] = [
  {
    id: 'lab-1-basics',
    name: 'Lab 1: Basics',
    status: 'active',
    submissions: 24,
    flagged: 3,
    deadline: 'May 20',
    avgScore: 87,
    description: 'Introduction to fundamental programming concepts including variables, control flow, and basic data structures.',
    requirements: [
      'Implement basic calculator functions',
      'Create a simple text-based game',
      'Write unit tests for all functions',
      'Submit code with proper documentation'
    ]
  },
  {
    id: 'lab-2-advanced',
    name: 'Lab 2: Advanced',
    status: 'analyzing',
    submissions: 18,
    flagged: 7,
    deadline: 'May 22',
    avgScore: 82,
    description: 'Advanced programming concepts including recursion, data structures, and algorithm optimization.',
    requirements: [
      'Implement sorting algorithms',
      'Create a binary search tree',
      'Optimize code for performance',
      'Write comprehensive tests'
    ]
  },
  {
    id: 'project-authentication',
    name: 'Project: Authentication',
    status: 'active',
    submissions: 31,
    flagged: 12,
    deadline: 'May 25',
    avgScore: 79,
    description: 'Build a complete authentication system with user registration, login, and session management.',
    requirements: [
      'User registration and login',
      'Password hashing and validation',
      'Session management',
      'Security best practices'
    ]
  },
  {
    id: 'midterm-review',
    name: 'Midterm Review',
    status: 'closed',
    submissions: 45,
    flagged: 8,
    deadline: 'Apr 30',
    avgScore: 84,
    description: 'Comprehensive review of all topics covered in the first half of the semester.',
    requirements: [
      'Complete all practice problems',
      'Review lecture notes',
      'Submit practice exam',
      'Attend review session'
    ]
  },
  {
    id: 'lab-3-data-structures',
    name: 'Lab 3: Data Structures',
    status: 'closed',
    submissions: 22,
    flagged: 5,
    deadline: 'Apr 15',
    avgScore: 85,
    description: 'Implementation and analysis of common data structures including linked lists, stacks, and queues.',
    requirements: [
      'Implement linked list',
      'Create stack and queue classes',
      'Analyze time complexity',
      'Write performance tests'
    ]
  },
  {
    id: 'project-api-design',
    name: 'Project: API Design',
    status: 'active',
    submissions: 15,
    flagged: 2,
    deadline: 'Jun 1',
    avgScore: 88,
    description: 'Design and implement a RESTful API with proper documentation and error handling.',
    requirements: [
      'Design API endpoints',
      'Implement CRUD operations',
      'Add authentication middleware',
      'Create API documentation'
    ]
  },
];

export default function AssignmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const assignment = mockAssignments.find(a => a.id === params.id);

  if (!assignment) {
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
            </div>
          </nav>

          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold font-syne text-white mb-4">Assignment Not Found</h1>
              <p className="text-white/60 mb-8">The assignment you're looking for doesn't exist or has been removed.</p>
              <Link href="/assignments" className="ghost-button-new">
                Back to Assignments
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)', text: '#22c55e' };
      case 'analyzing':
        return { bg: 'rgba(251, 146, 60, 0.15)', border: 'rgba(251, 146, 60, 0.4)', text: '#fb923c' };
      case 'closed':
        return { bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.4)', text: '#6b7280' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.4)', text: '#6b7280' };
    }
  };

  const statusColor = getStatusColor(assignment.status);

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
            <button className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white">
              <MoreVertical size={20} />
            </button>
          </div>
        </nav>

        <div className="flex-1 flex flex-col overflow-hidden p-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/60 font-jetbrains mb-6 flex-shrink-0">
            <Link href="/assignments" className="hover:text-white/80">Assignments</Link>
            <ChevronRight size={14} />
            <span className="text-white/80">{assignment.name}</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-8 flex-shrink-0">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-3xl font-bold font-syne text-white">{assignment.name}</h1>
                <span
                  className="filter-tab-badge"
                  style={{
                    borderColor: statusColor.border,
                    color: statusColor.text,
                    backgroundColor: statusColor.bg
                  }}
                >
                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                </span>
              </div>
              <p className="text-white/60 max-w-2xl">{assignment.description}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-8 flex-shrink-0">
            <div className="card-glassmorphism rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-[#c8a84b]" />
                <div className="text-xs text-white/50 font-syne">Submissions</div>
              </div>
              <div className="text-2xl font-bold text-[#e0b84e]">{assignment.submissions}</div>
            </div>
            <div className="card-glassmorphism rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-[#c8a84b]" />
                <div className="text-xs text-white/50 font-syne">Flagged</div>
              </div>
              <div className="text-2xl font-bold text-[#e0b84e]">{assignment.flagged}</div>
            </div>
            <div className="card-glassmorphism rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-[#c8a84b]" />
                <div className="text-xs text-white/50 font-syne">Avg Score</div>
              </div>
              <div className="text-2xl font-bold text-[#e0b84e]">{assignment.avgScore}%</div>
            </div>
            <div className="card-glassmorphism rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-[#c8a84b]" />
                <div className="text-xs text-white/50 font-syne">Deadline</div>
              </div>
              <div className="text-lg font-bold text-[#e0b84e] font-jetbrains">{assignment.deadline}</div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="flex-1 grid grid-cols-[60fr_40fr] gap-6 min-h-0">
            {/* Requirements */}
            <div className="card-glassmorphism rounded-xl p-6 flex flex-col">
              <div className="section-label mb-4">REQUIREMENTS</div>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <ul className="space-y-3">
                  {assignment.requirements?.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#c8a84b] mt-2 flex-shrink-0"></div>
                      <span className="text-white/80 text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="card-glassmorphism rounded-xl p-6 flex flex-col">
              <div className="section-label mb-4">ACTIONS</div>
              <div className="space-y-4">
                <Link href={`/assignments/${assignment.id}/plagiarism`} className="ghost-button-new w-full justify-center">
                  <Target size={16} />
                  <span className="text-sm font-semibold">View Plagiarism Report</span>
                </Link>
                <button className="ghost-button-new w-full justify-center">
                  <Play size={16} />
                  <span className="text-sm font-semibold">Run Analysis</span>
                </button>
                <button className="ghost-button-new w-full justify-center">
                  <Users size={16} />
                  <span className="text-sm font-semibold">View Submissions</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
