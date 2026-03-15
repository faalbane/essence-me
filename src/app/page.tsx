"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import { signInWithGoogle } from "@/lib/firebase/client";
import Button from "@/components/ui/Button";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  async function handleGetStarted() {
    if (user) {
      router.push("/dashboard");
      return;
    }
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      console.error("Sign in failed:", err);
    }
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-5 max-w-7xl mx-auto w-full animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="font-mono text-sm tracking-[0.3em] uppercase">
          <span className="text-amber-pale/80">essence</span>
          <span className="text-teal-glow/60">.me</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-[10px] font-mono tracking-widest text-[#4a4035] uppercase">
            sys.online
          </span>
          {loading ? null : user ? (
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleGetStarted}>
              Sign in
            </Button>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="flex-1 flex items-center justify-center px-6 sm:px-10 relative">
        {/* Atmospheric orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(232,145,42,0.04),transparent_60%)] blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-[radial-gradient(circle,rgba(0,180,190,0.03),transparent_60%)] blur-3xl pointer-events-none" />

        <div className="max-w-3xl w-full stagger-children">
          {/* Decorative data line */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-px bg-gradient-to-r from-teal-glow/40 to-transparent" />
            <span className="font-mono text-[10px] tracking-[0.4em] text-teal-glow/40 uppercase">
              Neural Interface v2.049
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6">
            <span className="block text-[#e8dcc8] animate-flicker">Your mind,</span>
            <span className="block mt-2 bg-gradient-to-r from-amber-glow via-amber-pale to-amber-glow bg-clip-text text-transparent animate-hologram">
              always available
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#6a5f50] max-w-lg leading-relaxed font-light mb-10">
            Train an AI that speaks in your voice, shares your knowledge, and
            reflects your personality. Let anyone ask you anything — even when
            you&apos;re not around.
          </p>

          {/* CTA cluster */}
          <div className="flex flex-col sm:flex-row gap-4 mb-20">
            <Button size="lg" onClick={handleGetStarted}>
              Create Your Essence
            </Button>
            <Button variant="secondary" size="lg" onClick={() => router.push("/demo")}>
              See a demo
            </Button>
          </div>

          {/* ── How it works ── */}
          <div className="relative">
            {/* Section divider */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-px bg-gradient-to-r from-amber-glow/20 to-transparent" />
              <span className="font-mono text-[10px] tracking-[0.4em] text-amber-glow/30 uppercase">
                Process
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-glow/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  num: "01",
                  title: "Train",
                  desc: "Chat with our AI interviewer. Share stories, opinions, expertise — everything that makes you, you.",
                },
                {
                  num: "02",
                  title: "Clone",
                  desc: "Record your voice, upload a photo. Your AI twin inherits your look and sound.",
                },
                {
                  num: "03",
                  title: "Share",
                  desc: "Share your link. Anyone can ask your essence questions and get responses in your voice.",
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className="group glass-panel rounded-sm p-6 hover:border-teal-glow/25 transition-all duration-500"
                >
                  {/* Step number */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-[10px] tracking-widest text-teal-glow/50 group-hover:text-teal-glow/80 transition-colors">
                      {step.num}
                    </span>
                    <div className="w-6 h-px bg-teal-glow/20 group-hover:w-10 group-hover:bg-teal-glow/40 transition-all duration-500" />
                  </div>
                  <h3 className="text-amber-pale font-bold text-lg tracking-wide mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[#5a5040] text-sm leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="px-6 sm:px-10 py-8 flex items-center justify-between max-w-7xl mx-auto w-full animate-fade-in" style={{ animationDelay: "1s" }}>
        <span className="font-mono text-[10px] tracking-[0.3em] text-[#2a2520] uppercase">
          essence.me
        </span>
        <span className="font-mono text-[10px] tracking-widest text-[#2a2520]">
          2049
        </span>
      </footer>
    </div>
  );
}
