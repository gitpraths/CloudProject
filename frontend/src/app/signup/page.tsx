"use client";

import Link from "next/link";

import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";

function AuthButtonSkeleton() {
  return (
    <div className="h-11 w-full rounded-2xl bg-white/10 animate-pulse" />
  );
}

export default function SignupPage() {
  const showSkeleton = false;

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(900px_circle_at_70%_0%,rgba(34,211,238,0.16),transparent_55%),linear-gradient(to_bottom,rgba(0,0,0,1),rgba(0,0,0,0.95))]">
      <Card className="w-full max-w-md rounded-2xl border-white/10 bg-white/5 backdrop-blur shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-white">Create account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-white/80">Name</div>
            <Input
              type="text"
              placeholder="Your name"
              className="w-full rounded-2xl border-white/10 bg-black/30 text-white placeholder:text-white/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-white/80">Email</div>
            <Input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-2xl border-white/10 bg-black/30 text-white placeholder:text-white/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-white/80">Password</div>
            <Input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-2xl border-white/10 bg-black/30 text-white placeholder:text-white/40"
            />
          </div>

          {showSkeleton ? (
            <AuthButtonSkeleton />
          ) : (
            <Button className="w-full px-6 py-3 rounded-2xl transition-transform duration-200 hover:scale-[1.01] shadow-[0_0_30px_rgba(34,211,238,0.25)]">
              Create Account
            </Button>
          )}

          <div className="text-sm text-white/60">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-300 hover:underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

