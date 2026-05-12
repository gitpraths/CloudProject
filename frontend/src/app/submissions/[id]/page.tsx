'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ChevronRight, Play, Bug, AlertTriangle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import '@/styles/plagiarism.css';

const ParticleBackground = dynamic(() => import('@/components/shared/ThreeBackground'), {
  ssr: false,
});

interface Bug {
  id: string;
  lineNumber: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface CodeSmell {
  id: string;
  lineNumber: number;
  description: string;
}

interface Suggestion {
  id: string;
  lineNumber: number;
  description: string;
}

const mockBugs: Bug[] = [
  { id: '1', lineNumber: 15, description: 'Potential division by zero error', severity: 'high' },
  { id: '2', lineNumber: 23, description: 'Missing null check before array access', severity: 'medium' },
  { id: '3', lineNumber: 42, description: 'Infinite loop condition', severity: 'high' },
];

const mockCodeSmells: CodeSmell[] = [
  { id: '1', lineNumber: 8, description: 'Long method with multiple responsibilities' },
  { id: '2', lineNumber: 19, description: 'Magic number without explanation' },
];

const mockSuggestions: Suggestion[] = [
  { id: '1', lineNumber: 12, description: 'Consider using built-in sort() function' },
  { id: '2', lineNumber: 25, description: 'Add error handling for file operations' },
  { id: '3', lineNumber: 33, description: 'Extract this logic into a separate function' },
];

const mockCode = `def calculate_average(numbers):
    """Calculate the average of a list of numbers."""
    if not numbers:
        return 0
    
    total = sum(numbers)
    count = len(numbers)
    return total / count

def find_median(numbers):
    """Find the median value in a list."""
    sorted_numbers = sorted(numbers)
    n = len(sorted_numbers)
    if n % 2 == 0:
        return (sorted_numbers[n//2-1] + sorted_numbers[n//2]) / 2
    else:
        return sorted_numbers[n//2]

def main():
    data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    print(f"Average: {calculate_average(data)}")
    print(f"Median: {find_median(data)}")`;

export default function SubmissionReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [reviewGenerated, setReviewGenerated] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    bugs: true,
    codeSmells: true,
    suggestions: true
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)', text: '#22c55e' };
      case 'medium': return { bg: 'rgba(251, 146, 60, 0.15)', border: 'rgba(251, 146, 60, 0.4)', text: '#fb923c' };
      case 'high': return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#ef4444' };
      default: return { bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.4)', text: '#6b7280' };
    }
  };

  const handleRunAIReview = () => {
    // Simulate AI review generation
    setTimeout(() => setReviewGenerated(true), 1500);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getHighlightedLine = (lineNumber: number) => {
    return mockBugs.some(bug => bug.lineNumber === lineNumber) ||
           mockCodeSmells.some(smell => smell.lineNumber === lineNumber);
  };

  const getHighlightColor = (lineNumber: number) => {
    const bug = mockBugs.find(bug => bug.lineNumber === lineNumber);
    if (bug) {
      return bug.severity === 'high' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(251, 146, 60, 0.2)';
    }
    return mockCodeSmells.some(smell => smell.lineNumber === lineNumber) ? 'rgba(251, 146, 60, 0.2)' : 'transparent';
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
          </div>
        </nav>

        <div className="flex-1 flex flex-col overflow-hidden p-6">
          {!reviewGenerated ? (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#c8a84b]/20 flex items-center justify-center animate-pulse">
                  <Play size={32} className="text-[#c8a84b]" />
                </div>
                <h3 className="text-xl font-bold font-syne text-white mb-3">No review generated yet</h3>
                <p className="text-white/60 mb-6">Click Run AI Review to analyze this submission.</p>
                <button
                  onClick={handleRunAIReview}
                  className="ghost-button-new"
                >
                  <Play size={16} />
                  <span className="text-sm font-semibold">Run AI Review</span>
                </button>
              </div>
            </div>
          ) : (
            /* Review Content */
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-2 text-sm text-white/60 font-jetbrains">
                  <Link href="/assignments" className="hover:text-white/80">Assignments</Link>
                  <ChevronRight size={14} />
                  <Link href="/assignments/lab-1-basics" className="hover:text-white/80">Lab 1: Basics</Link>
                  <ChevronRight size={14} />
                  <span className="text-white/80">STU-2024-001</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold font-syne text-white">STU-2024-001</h2>
                  <span className="text-sm text-white/60">Lab 1: Basics</span>
                  <span className="filter-tab-badge" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.4)', color: '#22c55e' }}>
                    Completed
                  </span>
                </div>
                
                <button className="ghost-button-new">
                  <Play size={16} />
                  <span className="text-sm font-semibold">Run AI Review</span>
                </button>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,168,75,0.6)', boxShadow: '0 0 12px rgba(200,168,75,0.15), 0 0 30px rgba(200,168,75,0.08), inset 0 0 20px rgba(200,168,75,0.03)' }}>
                  <div className="text-xs text-white/50 font-syne mb-1">Overall Score</div>
                  <div className="text-2xl font-bold text-[#e0b84e]">87/100</div>
                </div>
                <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,168,75,0.6)', boxShadow: '0 0 12px rgba(200,168,75,0.15), 0 0 30px rgba(200,168,75,0.08), inset 0 0 20px rgba(200,168,75,0.03)' }}>
                  <div className="text-xs text-white/50 font-syne mb-1">Complexity Rating</div>
                  <div className="text-2xl font-bold text-[#e0b84e]">6/10</div>
                </div>
                <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,168,75,0.6)', boxShadow: '0 0 12px rgba(200,168,75,0.15), 0 0 30px rgba(200,168,75,0.08), inset 0 0 20px rgba(200,168,75,0.03)' }}>
                  <div className="text-xs text-white/50 font-syne mb-1">Files Reviewed</div>
                  <div className="text-2xl font-bold text-[#e0b84e]">3</div>
                </div>
              </div>

              {/* Main Panel */}
              <div className="flex-1 grid grid-cols-[2fr_3fr] gap-4 min-h-0 overflow-hidden">
                {/* Left Column - Issues */}
                <div className="h-full overflow-y-auto scrollbar-hide">
                  <div className="space-y-4">
                    {/* Bugs */}
                    <div className="card-glassmorphism rounded-xl p-4">
                      <button
                        onClick={() => toggleSection('bugs')}
                        className="w-full flex items-center justify-between text-left mb-3"
                      >
                        <div className="flex items-center gap-2">
                          <Bug size={16} className="text-red-400" />
                          <span className="text-sm font-semibold text-white">Bugs ({mockBugs.length})</span>
                        </div>
                        {expandedSections.bugs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedSections.bugs && (
                        <div className="space-y-3">
                          {mockBugs.map((bug) => {
                            const colors = getSeverityColor(bug.severity);
                            return (
                              <div key={bug.id} className="border-l-4 pl-3" style={{ borderColor: colors.border }}>
                                <div className="flex items-start gap-2 mb-1">
                                  <span className="text-xs text-white/60 font-jetbrains">Line {bug.lineNumber}</span>
                                  <span className="filter-tab-badge" style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}>
                                    {bug.severity.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-sm text-white/80">{bug.description}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Code Smells */}
                    <div className="card-glassmorphism rounded-xl p-4">
                      <button
                        onClick={() => toggleSection('codeSmells')}
                        className="w-full flex items-center justify-between text-left mb-3"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={16} className="text-amber-400" />
                          <span className="text-sm font-semibold text-white">Code Smells ({mockCodeSmells.length})</span>
                        </div>
                        {expandedSections.codeSmells ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedSections.codeSmells && (
                        <div className="space-y-3">
                          {mockCodeSmells.map((smell) => (
                            <div key={smell.id} className="border-l-4 border-amber-500/50 pl-3">
                              <div className="flex items-start gap-2 mb-1">
                                <span className="text-xs text-white/60 font-jetbrains">Line {smell.lineNumber}</span>
                              </div>
                              <p className="text-sm text-white/80">{smell.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Suggestions */}
                    <div className="card-glassmorphism rounded-xl p-4">
                      <button
                        onClick={() => toggleSection('suggestions')}
                        className="w-full flex items-center justify-between text-left mb-3"
                      >
                        <div className="flex items-center gap-2">
                          <Lightbulb size={16} className="text-[#c8a84b]" />
                          <span className="text-sm font-semibold text-white">Suggestions ({mockSuggestions.length})</span>
                        </div>
                        {expandedSections.suggestions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedSections.suggestions && (
                        <div className="space-y-3">
                          {mockSuggestions.map((suggestion) => (
                            <div key={suggestion.id} className="border-l-4 border-[#c8a84b]/50 pl-3">
                              <div className="flex items-start gap-2 mb-1">
                                <span className="text-xs text-white/60 font-jetbrains">Line {suggestion.lineNumber}</span>
                              </div>
                              <p className="text-sm text-white/80">{suggestion.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Code Viewer */}
                <div className="card-glassmorphism rounded-xl p-4 h-full overflow-hidden">
                  <div className="text-sm text-white/80 font-jetbrains mb-3">main.py</div>
                  <div className="h-full overflow-y-auto scrollbar-hide">
                    <pre className="text-sm text-white/80 font-jetbrains font-mono">
                      {mockCode.split('\n').map((line, index) => (
                        <div
                          key={index}
                          className="flex"
                          style={{ backgroundColor: getHighlightColor(index + 1) }}
                        >
                          <span className="w-12 text-right text-xs text-white/30 pr-3 border-r border-white/5">
                            {index + 1}
                          </span>
                          <span className="flex-1 pl-3">{line || ' '}</span>
                        </div>
                      ))}
                    </pre>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
