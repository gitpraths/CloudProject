"use client";

import * as React from "react";
import { Code2, Gauge, Layers3, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { cn } from "@/lib/utils";

type Feature = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: Code2,
    title: "AI Code Review",
    description: "Actionable feedback that improves quality and consistency."
  },
  {
    icon: Layers3,
    title: "Plagiarism Detection",
    description: "Spot suspicious similarity signals across submissions."
  },
  {
    icon: Gauge,
    title: "Fast Analysis",
    description: "Optimized pipelines designed for quick turnaround."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Review together with shared context and clear outcomes."
  }
];

export function FeatureCards() {
  return (
    <section className="pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card
              key={f.title}
              className={cn(
                "rounded-2xl border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_0_40px_rgba(99,102,241,0.12)]"
              )}
            >
              <CardHeader className="space-y-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                  <f.icon className="h-5 w-5 text-cyan-300" />
                </div>
                <CardTitle className="text-base text-white">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-white/70">
                {f.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

