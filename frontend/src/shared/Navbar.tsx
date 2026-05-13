"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => mounted && pathname === path;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-wide text-white"
        >
          CodeReview AI
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors ${
              isActive("/dashboard")
                ? "text-white"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/assignments"
            className={`text-sm font-medium transition-colors ${
              isActive("/assignments")
                ? "text-white"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            Assignments
          </Link>

          <div className="w-px h-6 bg-white/10" />

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

