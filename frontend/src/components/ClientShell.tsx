"use client";

import dynamic from "next/dynamic";
import Navbar from "./Navbar";

const ParticleBackground = dynamic(() => import("./ParticleBackground"), {
  ssr: false,
});

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <ParticleBackground />
      <div className="page-shell">
        <Navbar />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
