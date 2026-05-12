'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Download, ChevronRight } from 'lucide-react';
import '@/styles/plagiarism.css';

const ParticleBackground = dynamic(() => import('@/components/shared/ThreeBackground'), {
  ssr: false,
});

interface SimilarityData {
  [key: string]: { [key: string]: number };
}

interface FlaggedPair {
  id: string;
  studentA: string;
  studentB: string;
  similarity: number;
  filesMatched: number;
}

const mockSimilarityData: SimilarityData = {
  'STU-001': { 'STU-001': 0, 'STU-002': 15, 'STU-003': 8, 'STU-004': 92, 'STU-005': 12, 'STU-006': 25, 'STU-007': 18, 'STU-008': 7 },
  'STU-002': { 'STU-001': 15, 'STU-002': 0, 'STU-003': 22, 'STU-004': 18, 'STU-005': 85, 'STU-006': 31, 'STU-007': 14, 'STU-008': 29 },
  'STU-003': { 'STU-001': 8, 'STU-002': 22, 'STU-003': 0, 'STU-004': 11, 'STU-005': 19, 'STU-006': 77, 'STU-007': 33, 'STU-008': 16 },
  'STU-004': { 'STU-001': 92, 'STU-002': 18, 'STU-003': 11, 'STU-004': 0, 'STU-005': 24, 'STU-006': 13, 'STU-007': 88, 'STU-008': 21 },
  'STU-005': { 'STU-001': 12, 'STU-002': 85, 'STU-003': 19, 'STU-004': 24, 'STU-005': 0, 'STU-006': 27, 'STU-007': 35, 'STU-008': 82 },
  'STU-006': { 'STU-001': 25, 'STU-002': 31, 'STU-003': 77, 'STU-004': 13, 'STU-005': 27, 'STU-006': 0, 'STU-007': 19, 'STU-008': 41 },
  'STU-007': { 'STU-001': 18, 'STU-002': 14, 'STU-003': 33, 'STU-004': 88, 'STU-005': 35, 'STU-006': 19, 'STU-007': 0, 'STU-008': 26 },
  'STU-008': { 'STU-001': 7, 'STU-002': 29, 'STU-003': 16, 'STU-004': 21, 'STU-005': 82, 'STU-006': 41, 'STU-007': 26, 'STU-008': 0 },
};

const mockFlaggedPairs: FlaggedPair[] = [
  { id: '1', studentA: 'STU-001', studentB: 'STU-004', similarity: 92, filesMatched: 3 },
  { id: '2', studentA: 'STU-002', studentB: 'STU-005', similarity: 85, filesMatched: 2 },
  { id: '3', studentA: 'STU-004', studentB: 'STU-007', similarity: 88, filesMatched: 4 },
  { id: '4', studentA: 'STU-005', studentB: 'STU-008', similarity: 82, filesMatched: 2 },
  { id: '5', studentA: 'STU-003', studentB: 'STU-006', similarity: 77, filesMatched: 1 },
];

const studentIds = Object.keys(mockSimilarityData);

function SimilarityMatrix({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const [hoveredCell, setHoveredCell] = useState<{row: string, col: string} | null>(null);

  const getCellColor = (similarity: number, isDiagonal: boolean) => {
    if (isDiagonal) return 'rgba(255,255,255,0.04)';
    if (similarity > 80) return 'rgba(220, 50, 50, 0.75)';
    if (similarity >= 60) return 'rgba(220, 150, 0, 0.75)';
    return 'rgba(30, 180, 80, 0.2)';
  };

  const handleCellClick = (studentA: string, studentB: string, similarity: number) => {
    if (similarity > 60 && studentA !== studentB) {
      const pairId = `${studentA}-vs-${studentB}`;
      router.push(`/assignments/${assignmentId}/plagiarism/${pairId}`);
    }
  };

  
  return (
    <div className="card-glassmorphism rounded-xl p-6" style={{ height: '45vh', overflow: 'hidden' }}>
      <div className="section-label mb-4">SIMILARITY MATRIX</div>
      <div style={{ overflow: 'auto', height: 'calc(100% - 40px)', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '600px' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px 4px', width: '80px' }}></th>
              {studentIds.map(id => (
                <th 
                  key={id} 
                  style={{ 
                    fontSize: '11px', 
                    color: 'rgba(255,255,255,0.5)', 
                    fontFamily: 'JetBrains Mono, monospace',
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    padding: '8px 4px',
                    textAlign: 'left',
                    width: '60px'
                  }}
                >
                  {id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {studentIds.map(rowId => (
              <tr key={rowId}>
                <td 
                  style={{ 
                    fontSize: '11px', 
                    color: 'rgba(255,255,255,0.5)', 
                    fontFamily: 'JetBrains Mono, monospace',
                    padding: '4px 12px 4px 0',
                    whiteSpace: 'nowrap',
                    width: '80px'
                  }}
                >
                  {rowId}
                </td>
                {studentIds.map(colId => {
                  const similarity = mockSimilarityData[rowId][colId];
                  const isDiagonal = rowId === colId;
                  const isHovered = hoveredCell?.row === rowId && hoveredCell?.col === colId;
                  
                  return (
                    <td
                      key={colId}
                      style={{
                        width: '60px',
                        height: '44px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontFamily: 'JetBrains Mono, monospace',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: getCellColor(similarity, isDiagonal),
                        border: isDiagonal ? '1px dashed rgba(255,255,255,0.1)' : 'none',
                        filter: isHovered ? 'brightness(1.3)' : 'none',
                        position: 'relative'
                      }}
                      onMouseEnter={() => setHoveredCell({row: rowId, col: colId})}
                      onMouseLeave={() => setHoveredCell(null)}
                      onClick={() => handleCellClick(rowId, colId, similarity)}
                    >
                      <span style={{ 
                        color: isDiagonal ? 'rgba(255,255,255,0.3)' : similarity > 60 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
                        fontWeight: similarity > 60 ? '600' : '400'
                      }}>
                        {isDiagonal ? '—' : `${similarity}%`}
                      </span>
                      
                      {/* Tooltip */}
                      {isHovered && !isDiagonal && (
                        <div style={{
                          position: 'absolute',
                          zIndex: 10,
                          bottom: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          marginBottom: '4px',
                          padding: '4px 8px',
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          color: 'white',
                          fontSize: '11px',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap',
                          fontFamily: 'JetBrains Mono, monospace'
                        }}>
                          {similarity}% similarity
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FlaggedPairsTable() {
  const router = useRouter();

  const getSimilarityColor = (similarity: number) => {
    if (similarity > 80) return { bg: 'rgba(220, 50, 50, 0.15)', border: 'rgba(220, 50, 50, 0.4)', text: '#dc3c3c' };
    return { bg: 'rgba(220, 150, 0, 0.15)', border: 'rgba(220, 150, 0, 0.4)', text: '#dc9600' };
  };

  return (
    <div className="card-glassmorphism rounded-xl p-6">
      <div className="section-label mb-4">FLAGGED PAIRS</div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-xs text-white/60 font-jetbrains pb-3">Student A</th>
              <th className="text-left text-xs text-white/60 font-jetbrains pb-3">Student B</th>
              <th className="text-left text-xs text-white/60 font-jetbrains pb-3">Similarity</th>
              <th className="text-left text-xs text-white/60 font-jetbrains pb-3">Files Matched</th>
              <th className="text-left text-xs text-white/60 font-jetbrains pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {mockFlaggedPairs.map((pair) => {
              const similarityColor = getSimilarityColor(pair.similarity);
              return (
                <tr key={pair.id} className="border-b border-white/5">
                  <td className="py-3 text-sm text-white/80 font-jetbrains">{pair.studentA}</td>
                  <td className="py-3 text-sm text-white/80 font-jetbrains">{pair.studentB}</td>
                  <td className="py-3">
                    <span
                      className="filter-tab-badge"
                      style={{
                        borderColor: similarityColor.border,
                        color: similarityColor.text,
                        backgroundColor: similarityColor.bg
                      }}
                    >
                      {pair.similarity}%
                    </span>
                  </td>
                  <td className="py-3 text-sm text-white/60">{pair.filesMatched}</td>
                  <td className="py-3">
                    <button
                      onClick={() => router.push(`/assignments/lab1/plagiarism/${pair.studentA}-vs-${pair.studentB}`)}
                      className="ghost-button text-xs"
                    >
                      View Diff
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PlagiarismPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleExportReport = () => {
    // Create CSV content for similarity matrix
    let csvContent = 'Student A,Student B,Similarity (%)\n';
    
    studentIds.forEach(studentA => {
      studentIds.forEach(studentB => {
        const similarity = mockSimilarityData[studentA][studentB];
        if (studentA !== studentB) { // Skip diagonal
          csvContent += `${studentA},${studentB},${similarity}\n`;
        }
      });
    });

    // Add flagged pairs section
    csvContent += '\nFlagged Pairs\n';
    csvContent += 'Student A,Student B,Similarity (%),Files Matched\n';
    mockFlaggedPairs.forEach(pair => {
      csvContent += `${pair.studentA},${pair.studentB},${pair.similarity},${pair.filesMatched}\n`;
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `plagiarism-report-${params.id}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <button className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white">
              <Download size={20} />
            </button>
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
                <span className="text-white/80">Plagiarism Report</span>
              </div>
              
              <div className="section-label mb-2">PLAGIARISM REPORT</div>
              <h2 className="text-3xl font-bold font-syne text-white">Lab 1: Basics</h2>
            </div>
            
            <button onClick={handleExportReport} className="ghost-button-new">
              <Download size={16} />
              <span className="text-sm font-semibold">Export Report</span>
            </button>
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-3 gap-4 mb-8 flex-shrink-0">
            <div className="card-glassmorphism rounded-lg p-4">
              <div className="text-xs text-white/50 font-syne mb-1">Total Pairs Analyzed</div>
              <div className="text-2xl font-bold text-[#e0b84e]">276</div>
            </div>
            <div className="card-glassmorphism rounded-lg p-4">
              <div className="text-xs text-white/50 font-syne mb-1">Flagged Pairs</div>
              <div className="text-2xl font-bold text-[#e0b84e]">8</div>
            </div>
            <div className="card-glassmorphism rounded-lg p-4">
              <div className="text-xs text-white/50 font-syne mb-1">Highest Similarity</div>
              <div className="text-2xl font-bold text-[#e0b84e]">92%</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6">
              <SimilarityMatrix assignmentId={params.id} />
              <FlaggedPairsTable />
            </div>
          </div>
        </div>
      </div>

          </main>
  );
}
