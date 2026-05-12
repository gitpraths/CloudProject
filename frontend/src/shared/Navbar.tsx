"use client";

import Link from "next/link";

import { Button } from "@/ui/button";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-wide text-white"
        >
          CodeReview AI
        </Link>

        <nav className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/5"
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button
            asChild
            className="px-6 py-3 rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_0_30px_rgba(99,102,241,0.35)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_40px_rgba(34,211,238,0.35)] transition-transform duration-200 hover:scale-[1.02]"
          >
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

