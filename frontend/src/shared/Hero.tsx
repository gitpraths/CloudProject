"use client";

import Link from "next/link";

import { Button } from "@/ui/button";
import { ThreeScene } from "@/shared/ThreeScene";

export function Hero() {
  return (
    <section className="relative pt-28 pb-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 shadow-sm">
            AI Powered Code Review
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Ship Better Code,{" "}
            <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Together
            </span>
            .
          </h1>

          <p className="max-w-xl text-pretty text-base leading-relaxed text-white/70 sm:text-lg">
            Automated reviews, plagiarism detection, and AI insights — all in one
            place.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              className="px-6 py-3 rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_0_34px_rgba(99,102,241,0.45)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_46px_rgba(34,211,238,0.40)] transition-transform duration-200 hover:scale-[1.03]"
            >
              <Link href="/signup">Get Started</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="px-6 py-3 rounded-2xl border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-transform duration-200 hover:scale-[1.02]"
            >
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>

        <div className="lg:pl-6">
          <ThreeScene />
        </div>
      </div>
    </section>
  );
}

