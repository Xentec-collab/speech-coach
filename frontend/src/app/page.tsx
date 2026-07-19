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
        
        <div className="flex items-center gap-3">
          {/* Light/Dark Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-bg)] transition-all outline-none">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {loading ? (
            <span className="text-xs text-[var(--text-secondary)] font-medium tracking-wide">Checking session...</span>
          ) : user ? (
            <Link href="/dashboard">
              <Button size="sm" className="bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:opacity-90 transition-all h-9 px-5">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold text-xs transition-all h-9">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:opacity-90 transition-all h-9 px-5">
                  Sign Up Free
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col z-10">
        <section className="relative py-24 md:py-36 lg:py-44 px-6 md:px-12 text-center max-w-5xl mx-auto flex flex-col items-center">
          
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent-text)] uppercase tracking-[0.15em] mb-10 anim-fadeup select-none">
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered Speech Training
          </span>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.035em] leading-[1.05] mb-8 anim-fadeup" style={{ animationDelay: '0.1s' }}>
            Master the Art of{' '}
            <br className="hidden sm:inline" />
            <span className="gradient-text">
              Public Speaking
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed mb-12 font-medium anim-fadeup" style={{ animationDelay: '0.2s' }}>
            Record speeches, receive instant structure-first AI feedback on clarity, fluency, and lexicon. Track metrics over time with interactive dashboards and custom speech roadmaps.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm sm:max-w-none anim-fadeup" style={{ animationDelay: '0.3s' }}>
            {user ? (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="bg-primary text-primary-foreground font-extrabold px-10 w-full h-13 rounded-xl hover:opacity-90 transition-all gap-2.5 shadow-xl shadow-primary/20 text-sm">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-primary text-primary-foreground font-extrabold px-10 w-full h-13 rounded-xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 text-sm">
                    Start Practicing Free
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="border-[var(--border-color)] bg-[var(--bg-card)]/50 text-[var(--text-primary)] hover:bg-[var(--bg-card)] w-full h-13 rounded-xl font-bold transition-all text-sm backdrop-blur-sm">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Subtle trust indicators */}
          <div className="flex items-center gap-6 mt-14 text-[11px] text-[var(--text-secondary)]/60 font-medium anim-fadeup" style={{ animationDelay: '0.5s' }}>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Privacy-First</span>
            <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)]/30" />
            <span>No Credit Card</span>
            <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)]/30" />
            <span>Instant Access</span>
          </div>
        </section>

        {/* ── Feature Highlights ──────────────────────────────────────────── */}
        <section className="px-6 md:px-12 max-w-6xl mx-auto w-full pb-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Everything You Need</h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">Comprehensive tools to transform your speaking skills from good to extraordinary.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Feature 1 */}
            <div className="group relative p-[1px] rounded-2xl bg-gradient-to-b from-[var(--border-color)] to-transparent hover:from-[var(--accent-color)]/30 hover:to-[var(--accent-color)]/5 transition-all duration-500">
              <div className="relative bg-[var(--bg-card)] rounded-[15px] p-8 h-full overflow-hidden border border-[var(--border-color)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-color)] mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Mic className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg font-bold tracking-tight mb-3">Practice Terminal</CardTitle>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Record directly in your browser with real-time feedback. Includes integrated timers, pause options, and immediate audio transcription.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-[1px] rounded-2xl bg-gradient-to-b from-[var(--border-color)] to-transparent hover:from-[var(--accent-color)]/30 hover:to-[var(--accent-color)]/5 transition-all duration-500">
              <div className="relative bg-[var(--bg-card)] rounded-[15px] p-8 h-full overflow-hidden border border-[var(--border-color)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-color)] mb-6 group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg font-bold tracking-tight mb-3">Structure-First Feedback</CardTitle>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Get scored on clarity, pacing, grammar, content structure, and vocabulary. Automatically highlights and flags common filler words.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-[1px] rounded-2xl bg-gradient-to-b from-[var(--border-color)] to-transparent hover:from-[var(--accent-color)]/30 hover:to-[var(--accent-color)]/5 transition-all duration-500">
              <div className="relative bg-[var(--bg-card)] rounded-[15px] p-8 h-full overflow-hidden border border-[var(--border-color)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-color)] mb-6 group-hover:scale-110 transition-transform duration-300">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg font-bold tracking-tight mb-3">Cohesive Dashboard</CardTitle>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Visualize improvement analytics, best scores, streak calendars, and vocabulary upgrades. Includes dual theme skins for customization.
                  </p>
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
