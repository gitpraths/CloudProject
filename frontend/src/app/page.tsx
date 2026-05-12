import { FeatureCards } from "@/shared/FeatureCards";
import { Hero } from "@/shared/Hero";
import { Navbar } from "@/shared/Navbar";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(1000px_circle_at_20%_-10%,rgba(34,211,238,0.18),transparent_45%),radial-gradient(900px_circle_at_80%_20%,rgba(139,92,246,0.20),transparent_50%),linear-gradient(to_bottom,rgba(0,0,0,1),rgba(0,0,0,0.95))] animated-gradient">
      <div className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(60%_60%_at_50%_20%,black,transparent)]">
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <Landing />
    </main>
  );
}

function Landing() {
  return (
    <>
      <Navbar />
      <Hero />
      <FeatureCards />
    </>
  );
}

