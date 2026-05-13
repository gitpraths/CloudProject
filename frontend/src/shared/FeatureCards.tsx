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
    <section className="pb-20 pt-20">
      <div className="w-full px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card
              key={f.title}
              className={cn(
                "rounded-2xl border border-[#c8a84b]/20 bg-gradient-to-br from-[#0f0f14] via-[#13121a] to-[#111118] shadow-[0_0_0_1px_rgba(200,168,75,0.2),0_0_20px_rgba(200,168,75,0.05)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_0_1px_rgba(200,168,75,0.4),0_0_32px_rgba(200,168,75,0.2)] p-8 min-h-80 flex flex-col justify-between hover:bg-gradient-to-br hover:from-[#12111a] hover:via-[#16151f] hover:to-[#131218]"
              )}
            >
              <CardHeader className="space-y-4 pb-6 p-0">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#c8a84b]/30 bg-gradient-to-br from-[#c8a84b]/10 to-[#c8a84b]/5 shadow-[0_0_12px_rgba(200,168,75,0.1)]">
                  <f.icon className="h-6 w-6 text-[#d4b860]" />
                </div>
                <CardTitle className="text-lg font-semibold text-white">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-base text-[#b0b0b0] p-0 leading-relaxed">
                {f.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

