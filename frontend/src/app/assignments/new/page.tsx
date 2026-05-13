'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Plus } from 'lucide-react';
import '@/styles/plagiarism.css';

const ParticleBackground = dynamic(() => import('@/components/shared/ThreeBackground'), {
  ssr: false,
});

interface FormData {
  name: string;
  description: string;
  deadline: string;
  language: string;
  maxFileSize: string;
}

export default function NewAssignmentPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    deadline: '',
    language: 'All',
    maxFileSize: '5MB'
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, boolean>>>({});

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Partial<Record<keyof FormData, boolean>> = {};
    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.description.trim()) newErrors.description = true;
    if (!formData.deadline) newErrors.deadline = true;
    
    setErrors(newErrors);
    
    // If no errors, proceed
    if (Object.keys(newErrors).length === 0) {
      // TODO: Handle actual submission
      console.log('Creating assignment:', formData);
      router.push('/assignments');
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
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
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="card-glassmorphism rounded-xl p-8 w-full max-w-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="section-label mb-4">NEW ASSIGNMENT</div>
              <h2 className="text-3xl font-bold font-syne text-white">Create Assignment</h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Assignment Name */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 font-syne">
                  Assignment Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg bg-black/20 border text-white placeholder-white/40 focus:outline-none focus:border-[#c8a84b] focus:border-2 transition-all ${
                    errors.name ? 'border-red-500' : 'border-white/10'
                  }`}
                  placeholder="Enter assignment name"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-400 font-syne">Assignment name is required</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 font-syne">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg bg-black/20 border text-white placeholder-white/40 focus:outline-none focus:border-[#c8a84b] focus:border-2 transition-all resize-none ${
                    errors.description ? 'border-red-500' : 'border-white/10'
                  }`}
                  placeholder="Enter assignment description"
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-400 font-syne">Description is required</p>
                )}
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-6">
                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2 font-syne">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg bg-black/20 border text-white focus:outline-none focus:border-[#c8a84b] focus:border-2 transition-all ${
                      errors.deadline ? 'border-red-500' : 'border-white/10'
                    }`}
                  />
                  {errors.deadline && (
                    <p className="mt-2 text-sm text-red-400 font-syne">Deadline is required</p>
                  )}
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2 font-syne">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-black/20 border text-white focus:outline-none focus:border-[#c8a84b] focus:border-2 transition-all border-white/10"
                  >
                    <option value="All">All</option>
                    <option value="Python">Python</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                  </select>
                </div>
              </div>

              {/* Max File Size */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 font-syne">
                  Max File Size
                </label>
                <select
                  value={formData.maxFileSize}
                  onChange={(e) => handleInputChange('maxFileSize', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black/20 border text-white focus:outline-none focus:border-[#c8a84b] focus:border-2 transition-all border-white/10"
                >
                  <option value="1MB">1MB</option>
                  <option value="5MB">5MB</option>
                  <option value="10MB">10MB</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Link
                  href="/assignments"
                  className="ghost-button-new flex-1 justify-center"
                >
                  <ArrowLeft size={16} />
                  <span className="text-sm font-semibold">Cancel</span>
                </Link>
                <button
                  type="submit"
                  className="w-full flex-1 justify-center text-sm font-semibold px-6 py-3 rounded-lg bg-[#c8a84b] text-white hover:bg-[#d4b860] transition-all border-none cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Create Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
