'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Upload, X, Check, ChevronRight } from 'lucide-react';
import '@/styles/plagiarism.css';

const ParticleBackground = dynamic(() => import('@/components/shared/ThreeBackground'), {
  ssr: false,
});

interface UploadedFile {
  id: string;
  name: string;
  size: number;
}

const mockAssignments = [
  'Lab 1: Basics',
  'Lab 2: Advanced', 
  'Project: Authentication',
  'Midterm Review',
  'Lab 3: Data Structures',
  'Project: API Design'
];

const allowedFileTypes = ['.py', '.java', '.cpp', '.c', '.js', '.ts'];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function SubmitPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  
  // Form state
  const [studentId, setStudentId] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: boolean}>({});
  
  // Success state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const generateSubmissionId = () => {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `SUB-2024-${randomNum}`;
  };

  const validateForm = () => {
    const newErrors: {[key: string]: boolean} = {};
    
    if (!studentId.trim()) newErrors.studentId = true;
    if (!selectedAssignment) newErrors.assignment = true;
    if (uploadedFiles.length === 0) newErrors.files = true;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Simulate submission
    const id = generateSubmissionId();
    setSubmissionId(id);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setStudentId('');
    setSelectedAssignment('');
    setUploadedFiles([]);
    setErrors({});
    setIsSubmitted(false);
    setSubmissionId('');
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return allowedFileTypes.includes(extension);
    });

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setErrors(prev => ({ ...prev, files: false }));
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  if (isSubmitted) {
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
            </div>
          </nav>

          {/* Success Content */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md w-full">
              <div className="card-glassmorphism rounded-xl p-8 text-center">
                {/* Success Icon */}
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={32} className="text-green-400" />
                </div>
                
                {/* Success Message */}
                <div className="section-label mb-4">SUBMISSION RECEIVED!</div>
                <h2 className="text-3xl font-bold font-syne text-white mb-6">Submission Received!</h2>
                
                {/* Submission ID */}
                <div className="mb-6">
                  <div className="text-xs text-white/50 font-syne mb-2">Submission ID</div>
                  <div className="text-lg font-jetbrains text-[#c8a84b]">{submissionId}</div>
                </div>
                
                {/* Assignment Confirmation */}
                <div className="mb-8">
                  <div className="text-xs text-white/50 font-syne mb-2">Assignment</div>
                  <div className="text-sm text-white/80">{selectedAssignment}</div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleReset}
                    className="w-full py-3 px-4 bg-[#c8a84b] text-black font-syne font-bold rounded-lg hover:bg-[#c8a84b]/90 transition-colors"
                  >
                    Submit Another
                  </button>
                  <Link
                    href="/submissions"
                    className="block w-full py-3 px-4 glassmorphism-button text-white font-syne font-medium rounded-lg hover:bg-white/10 transition-colors text-center"
                  >
                    View Submissions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

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

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-[680px] w-full">
            <div className="card-glassmorphism rounded-xl p-8">
              {/* Header */}
              <div className="mb-8">
                <div className="section-label mb-4">UPLOAD SUBMISSION</div>
                <h2 className="text-3xl font-bold font-syne text-white">Submit Assignment Files</h2>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student ID Field */}
                <div>
                  <label className="block text-sm font-syne text-white/80 mb-2">Student ID</label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => {
                      setStudentId(e.target.value);
                      setErrors(prev => ({ ...prev, studentId: false }));
                    }}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-lg font-jetbrains text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#c8a84b] focus:border-transparent transition-all ${
                      errors.studentId ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter your student ID"
                  />
                  {errors.studentId && (
                    <div className="mt-1 text-xs text-red-400 font-jetbrains">Student ID is required</div>
                  )}
                </div>

                {/* Assignment Dropdown */}
                <div>
                  <label className="block text-sm font-syne text-white/80 mb-2">Assignment</label>
                  <select
                    value={selectedAssignment}
                    onChange={(e) => {
                      setSelectedAssignment(e.target.value);
                      setErrors(prev => ({ ...prev, assignment: false }));
                    }}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-lg font-jetbrains text-white focus:outline-none focus:ring-2 focus:ring-[#c8a84b] focus:border-transparent transition-all ${
                      errors.assignment ? 'border-red-500' : 'border-white/20'
                    }`}
                  >
                    <option value="" className="bg-gray-900">Select an assignment</option>
                    {mockAssignments.map(assignment => (
                      <option key={assignment} value={assignment} className="bg-gray-900">
                        {assignment}
                      </option>
                    ))}
                  </select>
                  {errors.assignment && (
                    <div className="mt-1 text-xs text-red-400 font-jetbrains">Assignment selection is required</div>
                  )}
                </div>

                {/* File Upload Zone */}
                <div>
                  <label className="block text-sm font-syne text-white/80 mb-2">Files</label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 rounded-lg p-8 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-[#c8a84b] bg-[#c8a84b]/5'
                        : errors.files
                        ? 'border-red-500 border-dashed'
                        : 'border-dashed border-white/20 hover:border-white/40'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={allowedFileTypes.join(',')}
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    
                    {uploadedFiles.length === 0 ? (
                      <div>
                        <Upload size={48} className="mx-auto mb-4 text-white/40" />
                        <div className="text-white/80 font-syne mb-2">Drag files here or click to browse</div>
                        <div className="text-xs text-white/50 font-jetbrains">
                          Allowed types: {allowedFileTypes.join(', ')}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {uploadedFiles.map(file => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                          >
                            <div className="flex-1 text-left">
                              <div className="text-sm text-white/80 font-jetbrains truncate">{file.name}</div>
                              <div className="text-xs text-white/50 font-jetbrains">{formatFileSize(file.size)}</div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(file.id);
                              }}
                              className="ml-3 p-1 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        
                        <div className="pt-2 border-t border-white/10">
                          <div className="text-sm text-white/60 font-syne">
                            Click to add more files
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.files && (
                    <div className="mt-1 text-xs text-red-400 font-jetbrains">At least one file is required</div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#c8a84b] text-black font-syne font-bold rounded-lg hover:bg-[#c8a84b]/90 transition-colors"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
