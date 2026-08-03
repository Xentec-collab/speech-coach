"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Sparkles, Mic, BarChart2, ShieldCheck, Moon, Sun, ArrowRight, Check, X as XIcon } from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme-choice");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme-choice", newTheme);
  };

  const getThemeClass = () => {
    return theme === "light" ? "theme-light bg-[#f8fafc] text-[#0f172a]" : "theme-dark dark bg-[#09090b] text-[#f4f4f5]";
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 relative overflow-hidden ${getThemeClass()}`}>
      
      {/* ── Animated Background Mesh ──────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-25%] left-[-15%] w-[900px] h-[900px] rounded-full bg-blue-500/[0.05] blur-[180px]" />
        <div className="absolute bottom-[-25%] right-[-15%] w-[800px] h-[800px] rounded-full bg-cyan-500/[0.03] blur-[160px]" />
      </div>

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <header className="h-16 px-6 md:px-10 lg:px-16 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-nav)]/70 backdrop-blur-2xl sticky top-0 z-50 transition-colors duration-300">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg select-none" style={{ background: 'var(--logo-gradient)' }}>
            S
          </div>
          <span className="font-black text-lg tracking-tight">
            SpeakAI <span className="gradient-text">Coach</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2.5">
          {/* Light/Dark Toggle */}
          <button 
            onClick={toggleTheme} 
            aria-label="Toggle Theme" 
            className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.06] text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-white/[0.12] transition-all duration-200 backdrop-blur-md shadow-sm outline-none cursor-pointer"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {loading ? (
            <span className="text-xs text-[var(--text-secondary)] font-medium tracking-wide">Checking session...</span>
          ) : user ? (
            <Link href="/dashboard">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-full h-9 px-5 text-xs shadow-[0_0_15px_rgba(37,99,235,0.25)] hover:shadow-[0_0_22px_rgba(37,99,235,0.45)] transition-all duration-300 hover:scale-[1.02]">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white font-semibold text-xs rounded-full px-4 h-9 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-all">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-full h-9 px-5 text-xs shadow-[0_0_18px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all duration-300 hover:scale-[1.03] border border-blue-400/20">
                  Sign Up Free
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col z-10">
        <section className="relative pt-6 md:pt-10 lg:pt-14 pb-16 md:pb-24 px-6 md:px-12 text-center max-w-5xl mx-auto flex flex-col items-center">
          
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 dark:bg-blue-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />

          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/[0.08] dark:bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 backdrop-blur-md mb-5 shadow-[0_0_20px_rgba(59,130,246,0.12)] transition-all hover:border-blue-500/40 select-none anim-fadeup">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="tracking-wide">AI-Powered Speech Training</span>
            <Sparkles className="w-3.5 h-3.5 opacity-70 ml-0.5" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.035em] leading-[1.08] mb-5 anim-fadeup" style={{ animationDelay: '0.1s' }}>
            Master the Art of{' '}
            <br className="hidden sm:inline" />
            <span className="gradient-text">
              Public Speaking
            </span>
          </h1>
          
          <p className="text-sm md:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed mb-7 font-medium anim-fadeup" style={{ animationDelay: '0.2s' }}>
            Record speeches, receive instant structure-first AI feedback on clarity, fluency, and lexicon. Track metrics over time with interactive dashboards and custom speech roadmaps.
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center w-full max-w-sm sm:max-w-none anim-fadeup" style={{ animationDelay: '0.3s' }}>
            {user ? (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold h-11 px-8 rounded-full shadow-[0_0_25px_rgba(37,99,235,0.3)] hover:shadow-[0_0_35px_rgba(37,99,235,0.5)] transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2.5 text-sm w-full sm:w-auto">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold h-11 px-8 rounded-full shadow-[0_0_25px_rgba(37,99,235,0.3)] hover:shadow-[0_0_35px_rgba(37,99,235,0.5)] transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 text-sm w-full sm:w-auto group">
                    Start Practicing Free <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="h-11 px-8 rounded-full font-semibold border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-100/80 dark:bg-white/[0.04] hover:bg-slate-200/80 dark:hover:bg-white/[0.08] text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white transition-all duration-300 backdrop-blur-md flex items-center justify-center text-sm w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Subtle trust indicators */}
          <div className="flex items-center justify-center gap-6 mt-8 text-[11px] text-[var(--text-secondary)]/70 font-medium anim-fadeup" style={{ animationDelay: '0.4s' }}>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Privacy-First</span>
            <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)]/30" />
            <span>No Credit Card</span>
            <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)]/30" />
            <span>Instant Access</span>
          </div>
        </section>

        {/* ── Feature Highlights (Bento Grid) ─────────────────────────────── */}
        <section className="px-6 md:px-12 max-w-6xl mx-auto w-full pb-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Everything You Need</h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">Comprehensive tools to transform your speaking skills from good to extraordinary.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cell 1: Practice Terminal (Wide 2-col) */}
            <div className="md:col-span-2 group relative p-[1px] rounded-2xl bg-gradient-to-b from-[var(--border-color)] to-transparent hover:from-[var(--accent-color)]/30 hover:to-[var(--accent-color)]/5 transition-all duration-500">
              <div className="relative bg-[var(--bg-card)] rounded-[15px] p-8 h-full overflow-hidden border border-[var(--border-color)] flex flex-col md:flex-row gap-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-color)] mb-6 group-hover:scale-105 transition-transform duration-300">
                      <Mic className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl font-black tracking-tight mb-3">Speech Practice Terminal</CardTitle>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-[32ch]">
                      Record responses directly in your browser. Composes live wave shapes, precise timers, and instant speech transcription annotations.
                    </p>
                  </div>
                  <div className="mt-6">
                    <span className="text-[10px] font-black uppercase text-[var(--accent-text)] tracking-wider">Practice Console →</span>
                  </div>
                </div>
                {/* Visual Terminal Panel */}
                <div className="relative flex-1 bg-muted/30 dark:bg-zinc-900/40 rounded-xl border border-border/60 p-4 font-mono text-[11px] overflow-hidden min-h-[140px] flex flex-col justify-between select-none">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-border/40 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="text-[10px] text-muted-foreground/60 ml-2">terminal.sh</span>
                  </div>
                  <div className="space-y-1.5 flex-1 pt-3 text-muted-foreground">
                    <p className="text-[var(--accent-text)] font-semibold">$ speak-coach --listen</p>
                    <p className="text-foreground leading-normal">
                      "I believe that <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-bold border border-red-500/20 font-sans">uh</span> mental health is <span className="px-1 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20 font-sans">like</span> a critical topic..."
                    </p>
                  </div>
                  <div className="text-[10px] text-emerald-500 font-bold shrink-0 pt-2 flex justify-between items-center">
                    <span>• Evaluation active</span>
                    <span>1m 25s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cell 2: Structure-First Feedback (1-col) */}
            <div className="group relative p-[1px] rounded-2xl bg-gradient-to-b from-[var(--border-color)] to-transparent hover:from-[var(--accent-color)]/30 hover:to-[var(--accent-color)]/5 transition-all duration-500">
              <div className="relative bg-[var(--bg-card)] rounded-[15px] p-8 h-full overflow-hidden border border-[var(--border-color)] flex flex-col justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-color)] mb-6 group-hover:scale-105 transition-transform duration-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg font-black tracking-tight mb-3">AI Coach Evaluations</CardTitle>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Evaluates clarity, pacing, vocabulary quality, and sentence structures. Identifies exact moments where filler words and unnecessary pauses occur.
                  </p>
                </div>
                <div className="mt-6 z-10">
                  <span className="text-[10px] font-black uppercase text-[var(--accent-text)] tracking-wider">Coach Core →</span>
                </div>
              </div>
            </div>

            {/* Cell 3: Dashboard Analytics (1-col) */}
            <div className="group relative p-[1px] rounded-2xl bg-gradient-to-b from-[var(--border-color)] to-transparent hover:from-[var(--accent-color)]/30 hover:to-[var(--accent-color)]/5 transition-all duration-500">
              <div className="relative bg-[var(--bg-card)] rounded-[15px] p-8 h-full overflow-hidden border border-[var(--border-color)] flex flex-col justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-color)] mb-6 group-hover:scale-105 transition-transform duration-300">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg font-black tracking-tight mb-3">Cohesive Dashboard</CardTitle>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Track overall scores, vocabulary improvements, and daily practice streaks. Switch dynamically between premium light and dark workspace themes.
                  </p>
                </div>
                <div className="mt-6 z-10">
                  <span className="text-[10px] font-black uppercase text-[var(--accent-text)] tracking-wider">Analytics →</span>
                </div>
              </div>
            </div>

            {/* Cell 4: Interview Pathways (Wide 2-col) */}
            <div className="md:col-span-2 group relative p-[1px] rounded-2xl bg-gradient-to-b from-[var(--border-color)] to-transparent hover:from-[var(--accent-color)]/30 hover:to-[var(--accent-color)]/5 transition-all duration-500">
              <div className="relative bg-[var(--bg-card)] rounded-[15px] p-8 h-full overflow-hidden border border-[var(--border-color)] flex flex-col md:flex-row gap-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-color)] mb-6 group-hover:scale-105 transition-transform duration-300">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl font-black tracking-tight mb-3">Interview Pathway Roadmaps</CardTitle>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-[32ch]">
                      Practice pathways like Behavioral Prep, Software Engineering, or Public Speaking. Advance through difficulties and unlock milestones.
                    </p>
                  </div>
                  <div className="mt-6">
                    <span className="text-[10px] font-black uppercase text-[var(--accent-text)] tracking-wider">Pathways →</span>
                  </div>
                </div>
                {/* Visual Pathway Nodes */}
                <div className="relative flex-1 bg-muted/30 dark:bg-zinc-900/40 rounded-xl border border-border/60 p-4 overflow-hidden min-h-[140px] flex flex-col justify-center gap-3 select-none">
                  {[
                    { label: "Level 1: Tell Me About Yourself", status: "completed", color: "bg-emerald-500" },
                    { label: "Level 2: Handling Conflict", status: "active", color: "bg-blue-500 animate-pulse" },
                    { label: "Level 3: Behavioral Analysis", status: "locked", color: "bg-muted-foreground/30" }
                  ].map((lvl, index) => (
                    <div key={index} className="flex items-center gap-3 relative z-10">
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center text-[8px] font-bold text-white ${lvl.color}`}>
                        {lvl.status === "completed" ? "✓" : index + 1}
                      </span>
                      <span className="text-xs font-semibold text-foreground truncate">{lvl.label}</span>
                      <span className={`text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded border ml-auto ${
                        lvl.status === "completed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" :
                        lvl.status === "active" ? "bg-blue-500/10 border-blue-500/20 text-blue-600" : "bg-muted border-border text-muted-foreground"
                      }`}>{lvl.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── Pricing Tiers ──────────────────────────────────────────────── */}
        <section className="px-6 md:px-12 max-w-5xl mx-auto w-full pb-28 border-t border-[var(--border-color)]/30 pt-24">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Simple, Transparent Pricing</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Start free. Upgrade when you&apos;re ready for more.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            
            {/* Free Tier */}
            <div className="relative rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 flex flex-col h-full transition-all hover:border-[var(--accent-color)]/50">
              <div className="mb-6">
                <h3 className="text-xl font-bold tracking-tight mb-2">Free Plan</h3>
                <p className="text-sm text-[var(--text-secondary)]">Explore the basics of AI speech coaching</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-black tracking-tight">$0</span>
                <span className="text-sm text-[var(--text-secondary)] ml-1">/ month</span>
              </div>
              <ul className="space-y-3.5 text-sm mb-auto pb-8">
                <li className="flex items-center gap-3 text-[var(--text-secondary)]"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Limited speech analyses</li>
                <li className="flex items-center gap-3 text-[var(--text-secondary)]"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Basic feedback metrics</li>
                <li className="flex items-center gap-3 text-[var(--text-secondary)]"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Standard dashboard access</li>
                <li className="flex items-center gap-3 text-[var(--text-secondary)]/60"><XIcon className="w-4 h-4 text-red-400/60 shrink-0" /> Data deleted after 7 days</li>
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full h-11 border-[var(--border-color)] bg-transparent hover:bg-[var(--accent-bg)] font-semibold transition-all">Get Started</Button>
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-b from-[var(--accent-color)] to-[var(--accent-hover)] shadow-2xl">
              <div className="relative bg-[var(--bg-card)] rounded-[14.5px] p-8 flex flex-col h-full overflow-hidden">
                {/* Top glow */}
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[var(--accent-color)]/[0.04] to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight mb-2">Pro Plan</h3>
                      <p className="text-sm text-[var(--text-secondary)]">Maximize your speaking potential</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] text-[10px] font-bold uppercase tracking-wider shrink-0">Popular</span>
                  </div>
                  <div className="mb-8">
                    <span className="text-4xl font-black tracking-tight">$15</span>
                    <span className="text-sm text-[var(--text-secondary)] ml-1">/ month</span>
                  </div>
                  <ul className="space-y-3.5 text-sm mb-auto pb-8">
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Unlimited speech analyses</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Advanced feedback &amp; coach personas</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Full interview pathway roadmaps</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Data retained for 90 days</li>
                  </ul>
                  <Link href="/register">
                    <Button className="w-full h-11 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all">Start Free Trial</Button>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-10 border-t border-[var(--border-color)]/30 text-center z-10 transition-colors duration-300">
        <p className="text-xs text-[var(--text-secondary)]/60 font-medium">© {new Date().getFullYear()} SpeakAI Coach. Built for confident communication.</p>
      </footer>
    </div>
  );
}
