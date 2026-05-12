"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";

const ParticleBackground = dynamic(
  () => import("@/components/shared/ThreeBackground"),
  { ssr: false }
);

function AuthButtonSkeleton() {
  return (
    <div className="h-11 w-full rounded-2xl bg-white/10 animate-pulse" />
  );
}

export default function LoginPage() {
  const showSkeleton = false;

  return (
    <main className="relative min-h-screen flex items-center justify-center p-6 bg-black overflow-visible">
      <ParticleBackground isFixed={true} opacity={0.7} particleCount={150} particleSize={0.15} lineOpacity={0.4} />
      
      {/* Dark overlay for text contrast */}
      <div className="fixed inset-0 bg-[rgba(4,4,10,0.55)] z-0 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-2xl px-6">
        <Card className="w-full rounded-2xl border border-[#c8a84b]/15 bg-[rgba(8,8,16,0.75)] backdrop-blur-xl shadow-[0_0_0_1px_rgba(180,160,80,0.15),0_0_32px_rgba(200,168,75,0.1)] p-8 md:p-12">
          <CardHeader className="space-y-2 mb-8">
            <CardTitle className="text-3xl md:text-4xl text-white">Login</CardTitle>
            <p className="text-[#9a9a9a]">Welcome back to CodeReview AI</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="text-base font-medium text-white/80">Email</div>
              <Input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-2xl border-white/10 bg-black/30 text-white placeholder:text-white/40 px-4 py-3 text-base"
              />
            </div>

            <div className="space-y-3">
              <div className="text-base font-medium text-white/80">Password</div>
              <Input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border-white/10 bg-black/30 text-white placeholder:text-white/40 px-4 py-3 text-base"
              />
            </div>

            {showSkeleton ? (
              <AuthButtonSkeleton />
            ) : (
              <Button className="w-full px-8 py-4 rounded-2xl transition-transform duration-200 hover:scale-[1.01] shadow-[0_0_30px_rgba(99,102,241,0.35)] text-base font-semibold mt-8">
                Login
              </Button>
            )}

            <div className="text-base text-white/60 text-center pt-4">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#c8a84b] hover:underline font-semibold">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

