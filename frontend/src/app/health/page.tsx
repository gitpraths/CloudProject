"use client";

import { useHealth } from "@/hooks/useHealth";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/ui/card";

export default function HealthPage() {
  const { status } = useHealth();

  const statusClassName =
    status === "loading"
      ? "text-yellow-600"
      : status === "ok"
        ? "text-green-600"
        : "text-red-600";

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Backend Health</CardTitle>
          <CardDescription>Checks connectivity to the backend.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <span className="font-medium">Status:</span>{" "}
            <span className={cn("font-medium", statusClassName)}>{status}</span>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

