"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Sparkles, Mic, BarChart2, ShieldCheck, Moon, Sun, ArrowRight, Check, X as XIcon } from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? (resolvedTheme || theme) !== "light" : true;

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      
      {/* ── Neo-Brutalist Hero Header & Section ────────────────────────────── */}
      <div className="bg-[#FFDE59] text-black border-b-[3px] border-black relative">
        
        {/* ── Navbar ────────────────────────────────────────────────────────── */}
        <header className="px-5 sm:px-10 lg:px-16 py-4 flex items-center justify-between border-b-[2.5px] border-black max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-white border-2 border-black rounded-xl px-3 py-1.5 shadow-[3px_3px_0px_0px_#000] flex items-center gap-1.5 transition-transform group-hover:-rotate-2">
              <span className="text-xl">🎙️</span>
              <span className="font-black text-lg sm:text-xl tracking-tight text-black">
                Speak<span className="text-blue-600">AI</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-black text-black">
            <a href="#how-it-works" className="hover:underline underline-offset-4 decoration-[2.5px] transition-all">
              How it Works
            </a>
            <a href="#features" className="hover:underline underline-offset-4 decoration-[2.5px] transition-all">
              Training Modes
            </a>
            <a href="#pricing" className="hover:underline underline-offset-4 decoration-[2.5px] transition-all">
              Pricing
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Neo-Brutalist Theme Toggle */}
            <button 
              onClick={toggleTheme}
              aria-label="Toggle Theme" 
              className="w-10 h-10 rounded-xl bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none flex items-center justify-center transition-all cursor-pointer shrink-0"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-800" />}
            </button>

            {loading ? (
              <span className="text-xs font-bold text-black/60">...</span>
            ) : user ? (
              <Link href="/dashboard">
                <button className="neo-btn bg-[#99F6E4] px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm text-black flex items-center gap-1.5 cursor-pointer">
                  [ Go to Dashboard ➔ ]
                </button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-block font-black text-sm text-black hover:underline underline-offset-4 decoration-2 px-2">
                  Log In
                </Link>
                <Link href="/register">
                  <button className="neo-btn bg-[#99F6E4] px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm text-black cursor-pointer">
                    [ Unlock Your Charisma ]
                  </button>
                </Link>
              </>
            )}
          </div>
        </header>

        {/* ── Hero Split Section ────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 pt-10 sm:pt-14 pb-20 sm:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
            
            {/* Top Badge Sticker */}
            <div className="inline-flex items-center gap-2 bg-white border-2 border-black px-3.5 py-1 rounded-full text-xs font-black text-black shadow-[3px_3px_0px_0px_#000] mb-6 -rotate-1">
              <span>⚡</span>
              <span>AI-POWERED SPEECH COACH</span>
            </div>

            {/* Bold Punchy Headline (Exactly like reference image) */}
            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-black tracking-tight leading-[1.03] text-black">
              Speak Smooth.<br />
              Sound Smart.<br />
              Zero Sweat. 💦
            </h1>

            {/* Conversational Subtitle */}
            <p className="text-base sm:text-lg font-bold text-black/85 max-w-lg leading-relaxed mt-5 mb-8">
              Meet SpeakAI, your personal AI speaking coach. Practice presentations, interviews, or small talk in a safe, fun space!
            </p>

            {/* Brutalist Button: [ Start Practicing for Free ] */}
            <div className="w-full sm:w-auto">
              <Link href={user ? "/dashboard" : "/register"} className="block sm:inline-block">
                <button className="neo-btn bg-[#99F6E4] px-7 py-4 sm:px-8 sm:py-4.5 rounded-2xl font-black text-base sm:text-lg text-black w-full sm:w-auto text-center cursor-pointer">
                  [ Start Practicing for Free ]
                </button>
              </Link>
            </div>

            {/* Trust Stickers */}
            <div className="flex flex-wrap items-center gap-2.5 mt-8">
              <span className="inline-flex items-center gap-1.5 bg-white border-2 border-black px-3 py-1 rounded-lg text-xs font-black text-black shadow-[2px_2px_0px_0px_#000]">
                ✓ No Credit Card
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white border-2 border-black px-3 py-1 rounded-lg text-xs font-black text-black shadow-[2px_2px_0px_0px_#000]">
                ✓ 100% Private
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white border-2 border-black px-3 py-1 rounded-lg text-xs font-black text-black shadow-[2px_2px_0px_0px_#000]">
                ✓ Instant AI Feedback
              </span>
            </div>
          </div>

          {/* Right Column: Illustrated Mascot & Speech Bubbles */}
          <div className="lg:col-span-6 flex items-center justify-center relative min-h-[360px] sm:min-h-[440px]">
            
            {/* Mascot Image (mix-blend-multiply blends the white BG into the sunny yellow background!) */}
            <div className="relative z-10 flex items-center justify-center">
              <img 
                src="/speakai_mascot.jpg" 
                alt="SpeakAI Coach Mascot" 
                className="w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] lg:w-[430px] lg:h-[430px] object-contain mix-blend-multiply select-none pointer-events-none"
              />
            </div>

            {/* Speech Bubble Top-Left: "Ummm... ❌" */}
            <div className="absolute top-2 sm:top-6 left-1 sm:left-6 z-20 anim-float-left">
              <div className="bg-white border-[2.5px] border-black rounded-2xl px-4 py-2 sm:px-5 sm:py-2.5 shadow-[4px_4px_0px_0px_#000] flex items-center gap-2 relative">
                <span className="font-black text-sm sm:text-base text-black">Ummm...</span>
                <span className="w-5 h-5 rounded-full bg-red-500 border border-black flex items-center justify-center text-white font-black text-xs">✕</span>
                {/* Comic speech tail */}
                <div className="absolute -bottom-2 right-6 w-3.5 h-3.5 bg-white border-r-[2.5px] border-b-[2.5px] border-black rotate-45" />
              </div>
            </div>

            {/* Speech Bubble Top-Right: "Nailed it! 🎯" */}
            <div className="absolute top-0 sm:top-8 right-1 sm:right-6 z-20 anim-float-right">
              <div className="bg-[#99F6E4] border-[2.5px] border-black rounded-2xl px-4 py-2 sm:px-5 sm:py-2.5 shadow-[4px_4px_0px_0px_#000] flex items-center gap-2 relative">
                <span className="font-black text-sm sm:text-base text-black">Nailed it! 🎯</span>
                {/* Comic speech tail */}
                <div className="absolute -bottom-2 left-6 w-3.5 h-3.5 bg-[#99F6E4] border-l-[2.5px] border-b-[2.5px] border-black rotate-[-45deg]" />
              </div>
            </div>

            {/* Sticker Badge Bottom-Left: "0 Filler Words! ⚡" */}
            <div className="absolute bottom-2 left-2 sm:left-8 z-20 -rotate-3 hover:rotate-0 transition-transform">
              <div className="bg-[#FBCFE8] border-2 border-black rounded-xl px-3.5 py-1.5 shadow-[3px_3px_0px_0px_#000] flex items-center gap-1.5">
                <span className="font-black text-xs sm:text-sm text-black">0 Filler Words! ⚡</span>
              </div>
            </div>

            {/* Sticker Badge Bottom-Right: "94/100 Clarity 🚀" */}
            <div className="absolute bottom-6 right-2 sm:right-10 z-20 rotate-3 hover:rotate-0 transition-transform">
              <div className="bg-[#DDD6FE] border-2 border-black rounded-xl px-3.5 py-1.5 shadow-[3px_3px_0px_0px_#000] flex items-center gap-1.5">
                <span className="font-black text-xs sm:text-sm text-black">94/100 Clarity 🚀</span>
              </div>
            </div>

            {/* Decorative comic elements */}
            <div className="absolute top-1/2 left-0 text-2xl select-none animate-pulse">✨</div>
            <div className="absolute top-1/3 right-1 text-2xl select-none animate-bounce">⭐</div>
          </div>
        </div>

        {/* ── Bottom Transition Sticky Notes (Previewing Categories) ─────────── */}
        <div className="max-w-6xl mx-auto px-6 relative -mb-12 z-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Sticky 1: Mint Green */}
            <div className="bg-[#A7F3D0] border-[2.5px] border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000] -rotate-1 hover:rotate-0 hover:-translate-y-1 transition-all relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-pink-300/80 border border-black/30 rounded-sm rotate-2" />
              <div className="flex items-center gap-3 mb-2 pt-1">
                <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_#000]">
                  💼
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-black leading-tight">Job & Campus Prep</h3>
                  <span className="text-[10px] font-bold text-black/70">CAT · UPSC · Tech · HR</span>
                </div>
              </div>
              <p className="text-xs font-bold text-black/80 leading-snug">
                Practice real behavioral & technical interview tracks with adaptive AI follow-ups.
              </p>
            </div>

            {/* Sticky 2: Butter Yellow */}
            <div className="bg-[#FEF08A] border-[2.5px] border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000] rotate-1 hover:rotate-0 hover:-translate-y-1 transition-all relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-purple-300/80 border border-black/30 rounded-sm -rotate-2" />
              <div className="flex items-center gap-3 mb-2 pt-1">
                <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_#000]">
                  🎤
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-black leading-tight">Public Speaking</h3>
                  <span className="text-[10px] font-bold text-black/70">Impromptu · Debates · Pitches</span>
                </div>
              </div>
              <p className="text-xs font-bold text-black/80 leading-snug">
                Eliminate filler words (&quot;um&quot;, &quot;like&quot;) and master your cadence with instant pacing charts.
              </p>
            </div>

            {/* Sticky 3: Pastel Pink */}
            <div className="bg-[#FBCFE8] border-[2.5px] border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000] -rotate-2 hover:rotate-0 hover:-translate-y-1 transition-all relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-yellow-300/80 border border-black/30 rounded-sm rotate-1" />
              <div className="flex items-center gap-3 mb-2 pt-1">
                <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_#000]">
                  ✨
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-black leading-tight">Social Charisma</h3>
                  <span className="text-[10px] font-bold text-black/70">Small Talk · Storytelling</span>
                </div>
              </div>
              <p className="text-xs font-bold text-black/80 leading-snug">
                Level up your vocabulary and vocal confidence in a zero-judgment environment.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* ── Main Content Body (Offset for sticky cards) ────────────────────── */}
      <main className="flex-1 flex flex-col z-10 pt-20">

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
