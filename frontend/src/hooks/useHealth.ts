"use client";

import * as React from "react";

import { api } from "@/lib/api";

export type HealthStatus = "loading" | "ok" | "error";

export function useHealth() {
  const [status, setStatus] = React.useState<HealthStatus>("loading");

  React.useEffect(() => {
    let cancelled = false;
    const timeoutMs = 5000;

    const timeoutId = setTimeout(() => {
      if (!cancelled) setStatus("error");
    }, timeoutMs);

    (async () => {
      try {
        await api("/health", { method: "GET" });
        if (!cancelled) setStatus("ok");
      } catch {
        if (!cancelled) setStatus("error");
      } finally {
        clearTimeout(timeoutId);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return { status };
}

