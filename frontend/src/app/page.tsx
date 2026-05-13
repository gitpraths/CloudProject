"use client";

import dynamic from "next/dynamic";
import { FeatureCards } from "@/shared/FeatureCards";
import { Hero } from "@/shared/Hero";
import { Navbar } from "@/shared/Navbar";

const ParticleBackground = dynamic(
  () => import("@/components/shared/ThreeBackground"),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      <ParticleBackground opacity={0.7} particleCount={150} />

      <div className="relative z-10">
        <Navbar />
        <Hero />
      </div>

      {/* Landing page sections with optimized particle visibility */}
      <div className="relative">
        <ParticleBackground opacity={0.6} particleCount={150} particleSize={0.12} lineOpacity={0.35} />
        <div className="relative z-10">
          <FeatureCards />
        
          {/* Benefits Section */}
          <section className="pb-20 pt-20">
          <div className="w-full px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-12 text-center">Why Choose CodeReview AI?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: "Save Time", description: "Automated reviews cut feedback time by 70%." },
                { title: "Improve Quality", description: "Catch bugs and style issues before production." },
                { title: "Scale Your Team", description: "Review more submissions without hiring more reviewers." },
                { title: "Fair & Consistent", description: "AI applies the same standards to every submission." }
              ].map((benefit) => (
                <div key={benefit.title} className="p-6 rounded-lg border border-[#c8a84b]/15 bg-gradient-to-br from-[#0a0a0f] to-[#0f0f14] hover:shadow-[0_0_20px_rgba(200,168,75,0.1)] transition-all">
                  <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-[#b0b0b0]">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="pb-20 pt-20 border-t border-white/5">
          <div className="w-full px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-12 text-center">Trusted by Teams</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { stat: "10K+", label: "Code Reviews" },
                { stat: "500+", label: "Happy Teams" },
                { stat: "99.9%", label: "Uptime" }
              ].map((item) => (
                <div key={item.label} className="text-center p-8 rounded-lg border border-[#c8a84b]/10 bg-gradient-to-br from-[#0f0f14]/50 to-[#111118]/50">
                  <div className="text-4xl font-bold bg-gradient-to-r from-[#c8a84b] to-[#d4b860] bg-clip-text text-transparent mb-2">{item.stat}</div>
                  <div className="text-[#9a9a9a]">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="pb-20 pt-20">
          <div className="w-full px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-12 text-center">Perfect For</h2>
            <div className="space-y-4">
              {[
                "Educational Institutions - Scale code review without overwhelming TAs",
                "Bootcamps & Coding Schools - Provide instant feedback to students",
                "Development Teams - Enforce code standards across the organization",
                "Open Source Projects - Manage community contributions efficiently"
              ].map((useCase, idx) => (
                <div key={idx} className="p-5 rounded-lg border border-white/5 bg-gradient-to-r from-[#0f0f14] to-[#111118] hover:border-[#c8a84b]/20 transition-all">
                  <p className="text-white/90 flex items-center gap-3">
                    <span className="text-[#c8a84b]">✓</span>
                    {useCase}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pb-20 pt-20 border-t border-white/5">
          <div className="w-full px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
              <p className="text-lg text-[#b0b0b0] mb-8">Join hundreds of teams using CodeReview AI to streamline their code review process.</p>
              <button className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#c8a84b] to-[#d4b860] text-black font-semibold hover:shadow-[0_0_20px_rgba(200,168,75,0.4)] transition-all hover:scale-105">
                Get Started Free
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>

      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
    </main>
  );
}

