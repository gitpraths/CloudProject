"use client";

import Link from "next/link";

import { Button } from "@/ui/button";
import HeroParticles from "@/components/shared/HeroParticles";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden" style={{ background: "#09080a" }}>
      {/* ── Particle constellation background ── */}
      <HeroParticles />

      {/* ── Radial glow behind text ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 0,
          background:
            "radial-gradient(ellipse 70% 55% at 50% 55%, rgba(251,146,60,0.10) 0%, rgba(250,204,21,0.06) 40%, transparent 70%)",
        }}
      />

      {/* ── Content ── */}
      <div
        className="relative mx-auto flex flex-1 max-w-3xl flex-col items-center justify-center gap-8 px-6 py-32 text-center"
        style={{ zIndex: 1 }}
      >
        {/* Badge */}
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/70 shadow-sm backdrop-blur-sm">
          ✦&nbsp;&nbsp;AI Powered Code Review
        </div>

        {/* Headline */}
        <h1 className="text-balance text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Ship Better Code,{" "}
          <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
            Together
          </span>
          .
        </h1>

        {/* Subtext */}
        <p className="max-w-xl text-pretty text-base leading-relaxed text-white/60 sm:text-lg">
          Automated reviews, plagiarism detection, and AI insights — all in one
          place. Collaborate smarter and ship with confidence.
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Button
            asChild
            className="px-8 py-3 rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_0_34px_rgba(99,102,241,0.45)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_46px_rgba(34,211,238,0.40)] transition-transform duration-200 hover:scale-[1.03]"
          >
            <Link href="/signup">Get Started</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="px-8 py-3 rounded-2xl border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-transform duration-200 hover:scale-[1.02] backdrop-blur-sm"
          >
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
