'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Flag, ChevronRight, ChevronDown } from 'lucide-react';
import '@/styles/plagiarism.css';

const ParticleBackground = dynamic(() => import('@/components/shared/ThreeBackground'), {
  ssr: false,
});

interface CodeLine {
  lineNumber: number;
  content: string;
  isMatched: boolean;
}

interface FileOption {
  name: string;
  path: string;
}

const mockCodeA: CodeLine[] = [
  { lineNumber: 1, content: 'def calculate_average(numbers):', isMatched: false },
  { lineNumber: 2, content: '    """Calculate the average of a list of numbers."""', isMatched: false },
  { lineNumber: 3, content: '    if not numbers:', isMatched: true },
  { lineNumber: 4, content: '        return 0', isMatched: true },
  { lineNumber: 5, content: '    ', isMatched: false },
  { lineNumber: 6, content: '    total = sum(numbers)', isMatched: true },
  { lineNumber: 7, content: '    count = len(numbers)', isMatched: true },
  { lineNumber: 8, content: '    return total / count', isMatched: true },
  { lineNumber: 9, content: '', isMatched: false },
  { lineNumber: 10, content: 'def find_median(numbers):', isMatched: false },
  { lineNumber: 11, content: '    """Find the median value in a list."""', isMatched: false },
  { lineNumber: 12, content: '    sorted_numbers = sorted(numbers)', isMatched: true },
  { lineNumber: 13, content: '    n = len(sorted_numbers)', isMatched: true },
  { lineNumber: 14, content: '    if n % 2 == 0:', isMatched: true },
  { lineNumber: 15, content: '        return (sorted_numbers[n//2-1] + sorted_numbers[n//2]) / 2', isMatched: true },
  { lineNumber: 16, content: '    else:', isMatched: true },
  { lineNumber: 17, content: '        return sorted_numbers[n//2]', isMatched: true },
  { lineNumber: 18, content: '', isMatched: false },
  { lineNumber: 19, content: 'def main():', isMatched: false },
  { lineNumber: 20, content: '    data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]', isMatched: true },
  { lineNumber: 21, content: '    print(f"Average: {calculate_average(data)}")', isMatched: true },
  { lineNumber: 22, content: '    print(f"Median: {find_median(data)}")', isMatched: true },
];

const mockCodeB: CodeLine[] = [
  { lineNumber: 1, content: 'def calculate_average(nums):', isMatched: false },
  { lineNumber: 2, content: '    """Calculate the average of a list of numbers."""', isMatched: false },
  { lineNumber: 3, content: '    if not nums:', isMatched: true },
  { lineNumber: 4, content: '        return 0', isMatched: true },
  { lineNumber: 5, content: '    ', isMatched: false },
  { lineNumber: 6, content: '    total = sum(nums)', isMatched: true },
  { lineNumber: 7, content: '    count = len(nums)', isMatched: true },
  { lineNumber: 8, content: '    return total / count', isMatched: true },
  { lineNumber: 9, content: '', isMatched: false },
  { lineNumber: 10, content: 'def find_median(numbers):', isMatched: false },
  { lineNumber: 11, content: '    """Find the median value in a list."""', isMatched: false },
  { lineNumber: 12, content: '    sorted_numbers = sorted(numbers)', isMatched: true },
  { lineNumber: 13, content: '    n = len(sorted_numbers)', isMatched: true },
  { lineNumber: 14, content: '    if n % 2 == 0:', isMatched: true },
  { lineNumber: 15, content: '        return (sorted_numbers[n//2-1] + sorted_numbers[n//2]) / 2', isMatched: true },
  { lineNumber: 16, content: '    else:', isMatched: true },
  { lineNumber: 17, content: '        return sorted_numbers[n//2]', isMatched: true },
  { lineNumber: 18, content: '', isMatched: false },
  { lineNumber: 19, content: 'def main():', isMatched: false },
  { lineNumber: 20, content: '    data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]', isMatched: true },
  { lineNumber: 21, content: '    print(f"Average: {calculate_average(data)}")', isMatched: true },
  { lineNumber: 22, content: '    print(f"Median: {find_median(data)}")', isMatched: true },
];

const fileOptions: FileOption[] = [
  { name: 'main.py', path: '/src/main.py' },
  { name: 'utils.py', path: '/src/utils.py' },
  { name: 'calculations.py', path: '/src/calculations.py' },
];

function CodeDiffViewer() {
  const [selectedFileA, setSelectedFileA] = useState(fileOptions[0]);
  const [selectedFileB, setSelectedFileB] = useState(fileOptions[0]);
  const [showFileDropdownA, setShowFileDropdownA] = useState(false);
  const [showFileDropdownB, setShowFileDropdownB] = useState(false);
  const leftPanelRef = React.useRef<HTMLDivElement>(null);
  const rightPanelRef = React.useRef<HTMLDivElement>(null);

  const handleScrollSync = (source: 'left' | 'right') => {
    if (source === 'left' && leftPanelRef.current && rightPanelRef.current) {
      rightPanelRef.current.scrollTop = leftPanelRef.current.scrollTop;
    } else if (source === 'right' && rightPanelRef.current && leftPanelRef.current) {
      leftPanelRef.current.scrollTop = rightPanelRef.current.scrollTop;
    }
  };

  return (
    <div className="card-glassmorphism rounded-xl p-6 h-full flex flex-col">
      <div className="section-label mb-4">SIDE BY SIDE COMPARISON</div>
      
      {/* File Headers */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/80 font-jetbrains">STU-2024-045</span>
            <div className="relative">
              <button
                onClick={() => setShowFileDropdownA(!showFileDropdownA)}
                className="ghost-button text-xs flex items-center gap-1"
              >
                {selectedFileA.name}
                {showFileDropdownA ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              {showFileDropdownA && (
                <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/10 rounded-lg shadow-lg z-10 min-w-full">
                  {fileOptions.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => {
                        setSelectedFileA(file);
                        setShowFileDropdownA(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/10 hover:text-white"
                    >
                      {file.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/80 font-jetbrains">STU-2024-067</span>
            <div className="relative">
              <button
                onClick={() => setShowFileDropdownB(!showFileDropdownB)}
                className="ghost-button text-xs flex items-center gap-1"
              >
                {selectedFileB.name}
                {showFileDropdownB ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              {showFileDropdownB && (
                <div className="absolute top-full left-0 mt-1 bg-black/90 border border-white/10 rounded-lg shadow-lg z-10 min-w-full">
                  {fileOptions.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => {
                        setSelectedFileB(file);
                        setShowFileDropdownB(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/10 hover:text-white"
                    >
                      {file.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 grid grid-cols-[1fr_1fr] gap-0 min-h-0 relative">
        {/* Left Panel - Student A */}
        <div className="bg-black/20 rounded-l-lg border border-white/10 overflow-hidden">
          <div 
            ref={leftPanelRef}
            onScroll={() => handleScrollSync('left')}
            className="overflow-y-auto h-full scrollbar-hide"
          >
            {mockCodeA.map((line) => (
              <div
                key={line.lineNumber}
                className={`flex border-b border-white/5 ${
                  line.isMatched ? 'bg-[rgba(200,168,75,0.15)]' : ''
                }`}
              >
                <div className="w-12 text-right text-xs text-white/30 font-jetbrains p-2 pr-3 border-r border-white/5">
                  {line.lineNumber}
                </div>
                <div className="flex-1 text-sm text-white/80 font-jetbrains p-2 font-mono">
                  {line.content || ' '}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[rgba(200,168,75,0.2)] transform -translate-x-1/2"></div>

        {/* Right Panel - Student B */}
        <div className="bg-black/20 rounded-r-lg border border-white/10 overflow-hidden">
          <div 
            ref={rightPanelRef}
            onScroll={() => handleScrollSync('right')}
            className="overflow-y-auto h-full scrollbar-hide"
          >
            {mockCodeB.map((line) => (
              <div
                key={line.lineNumber}
                className={`flex border-b border-white/5 ${
                  line.isMatched ? 'bg-[rgba(200,168,75,0.15)]' : ''
                }`}
              >
                <div className="w-12 text-right text-xs text-white/30 font-jetbrains p-2 pr-3 border-r border-white/5">
                  {line.lineNumber}
                </div>
                <div className="flex-1 text-sm text-white/80 font-jetbrains p-2 font-mono">
                  {line.content || ' '}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlagiarismDiffPage({ params }: { params: { id: string, pairId: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Extract student IDs from pairId
  const [studentA, studentB] = params.pairId.split('-vs-');

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

        <div className="flex-1 flex flex-col overflow-hidden p-8">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-white/60 font-jetbrains mb-3">
                <Link href="/assignments" className="hover:text-white/80">Assignments</Link>
                <ChevronRight size={14} />
                <Link href={`/assignments/${params.id}`} className="hover:text-white/80">Lab 1: Basics</Link>
                <ChevronRight size={14} />
                <Link href={`/assignments/${params.id}/plagiarism`} className="hover:text-white/80">Plagiarism Report</Link>
                <ChevronRight size={14} />
                <span className="text-white/80">{studentA} vs {studentB}</span>
              </div>
              
              <div className="flex items-center gap-4 mb-2">
                <div className="section-label">SIMILARITY ANALYSIS</div>
                <div className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-lg">
                  <span className="text-red-400 font-bold text-lg font-jetbrains">92%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-3 gap-4 mb-8 flex-shrink-0">
            <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,168,75,0.6)', boxShadow: '0 0 12px rgba(200,168,75,0.15), 0 0 30px rgba(200,168,75,0.08), inset 0 0 20px rgba(200,168,75,0.03)' }}>
              <div className="text-xs text-white/50 font-syne mb-1">Files Matched</div>
              <div className="text-2xl font-bold text-[#e0b84e]">3</div>
            </div>
            <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,168,75,0.6)', boxShadow: '0 0 12px rgba(200,168,75,0.15), 0 0 30px rgba(200,168,75,0.08), inset 0 0 20px rgba(200,168,75,0.03)' }}>
              <div className="text-xs text-white/50 font-syne mb-1">Matching Blocks</div>
              <div className="text-2xl font-bold text-[#e0b84e]">14</div>
            </div>
            <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,168,75,0.6)', boxShadow: '0 0 12px rgba(200,168,75,0.15), 0 0 30px rgba(200,168,75,0.08), inset 0 0 20px rgba(200,168,75,0.03)' }}>
              <div className="text-xs text-white/50 font-syne mb-1">Similarity Score</div>
              <div className="text-2xl font-bold text-[#e0b84e]">92%</div>
            </div>
          </div>

          {/* Main Content - Code Diff Viewer */}
          <div className="flex-1 min-h-0">
            <CodeDiffViewer />
          </div>
        </div>
      </div>

          </main>
  );
}
