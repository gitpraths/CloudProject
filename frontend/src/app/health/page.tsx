"use client";

import dynamic from "next/dynamic";
import { useHealth } from "@/hooks/useHealth";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/ui/card";

const ParticleBackground = dynamic(
  () => import("@/components/shared/ThreeBackground"),
  { ssr: false }
);

export default function HealthPage() {
  const { status } = useHealth();

  const statusClassName =
    status === "loading"
      ? "text-yellow-600"
      : status === "ok"
        ? "text-green-600"
        : "text-red-600";

  return (
    <main className="relative min-h-screen flex items-center justify-center p-6 bg-black overflow-hidden">
      <ParticleBackground isFixed={true} opacity={0.3} particleCount={90} />
      
      {/* Dark overlay for text contrast */}
      <div className="absolute inset-0 bg-[rgba(8,8,16,0.6)] z-[1] pointer-events-none" />
      
      <div className="relative z-10">
        <Card className="w-full max-w-sm rounded-2xl border border-[#c8a84b]/15 bg-[rgba(8,8,16,0.75)] backdrop-blur-xl shadow-[0_0_0_1px_rgba(180,160,80,0.15),0_0_32px_rgba(200,168,75,0.1)]">
          <CardHeader>
            <CardTitle className="text-white">Backend Health</CardTitle>
            <CardDescription className="text-[#9a9a9a]">Checks connectivity to the backend.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <span className="font-medium text-white/80">Status:</span>{" "}
              <span className={cn("font-medium", statusClassName)}>{status}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

