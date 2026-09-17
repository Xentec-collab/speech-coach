"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { 
  Sparkles, Mic, BarChart2, ShieldCheck, Moon, Sun, ArrowRight, 
  Check, X as XIcon, Zap, Heart, MessageSquare, Award, Flame, 
  Play, Volume2, Star, ThumbsUp, ChevronRight, Lock, Briefcase, Smile
} from "lucide-react";

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
    <div className="min-h-screen flex flex-col font-sans bg-[#FAF8F5] text-black selection:bg-black selection:text-yellow-300">
      
      {/* ── Top Announcement Banner ────────────────────────────────────────── */}
      <div className="bg-black text-white text-[11px] sm:text-xs font-black py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2 select-none border-b-2 border-black">
        <span className="bg-[#FFDE59] text-black px-1.5 py-0.5 rounded text-[10px] font-black uppercase">New</span>
        <span>Meet Rizzkey 2.0: Real-time filler word detection &amp; Charisma Scoring is live!</span>
        <span className="hidden sm:inline">🚀</span>
      </div>

      {/* ── Neo-Brutalist Hero Header & Section ────────────────────────────── */}
      <div className="bg-[#FFDE59] text-black border-b-[3px] border-black relative select-none">
        
        {/* ── Navbar ────────────────────────────────────────────────────────── */}
        <header className="px-5 sm:px-10 lg:px-16 py-4 flex items-center justify-between border-b-[2.5px] border-black max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-white border-[2.5px] border-black rounded-2xl px-3.5 py-1.5 shadow-[3px_3px_0px_0px_#000] flex items-center gap-2 transition-transform group-hover:-rotate-3">
              <span className="text-xl sm:text-2xl">🔑</span>
              <span className="font-black text-xl sm:text-2xl tracking-tight text-black">
                Rizz<span className="text-blue-600">key</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-black text-black">
            <a href="#how-it-works" className="hover:underline underline-offset-4 decoration-[2.5px] transition-all">
              How it Works
            </a>
            <a href="#training-modes" className="hover:underline underline-offset-4 decoration-[2.5px] transition-all">
              Training Modes
            </a>
            <a href="#wall-of-rizz" className="hover:underline underline-offset-4 decoration-[2.5px] transition-all">
              Wall of Rizz
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
              <span>YOUR PERSONAL AI SPEAKING COACH</span>
            </div>

            {/* Bold Punchy Headline (Exactly like reference image) */}
            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-black tracking-tight leading-[1.03] text-black">
              Speak Smooth.<br />
              Sound Smart.<br />
              Zero Sweat. 💦
            </h1>

            {/* Conversational Subtitle */}
            <p className="text-base sm:text-lg font-bold text-black/85 max-w-lg leading-snug mt-5 mb-8">
              Meet Rizzkey, your personal AI speaking coach. Practice presentations, interviews, dates, or small talk in a safe, fun space!
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
                alt="Rizzkey Mascot" 
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
        <div className="max-w-6xl mx-auto px-6 relative -mb-14 z-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            
            {/* Sticky 1: Mint Green */}
            <div className="bg-[#A7F3D0] border-[2.5px] border-black rounded-2xl p-5 shadow-[5px_5px_0px_0px_#000] -rotate-1 hover:rotate-0 hover:-translate-y-1 transition-all relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-pink-300/90 border border-black/40 rounded-sm rotate-2" />
              <div className="flex items-center gap-3 mb-2 pt-1">
                <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_#000]">
                  💼
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-black leading-tight">Job &amp; Campus Interviews</h3>
                  <span className="text-[10px] font-bold text-black/70">CAT · UPSC · Tech · Product · HR</span>
                </div>
              </div>
              <p className="text-xs font-bold text-black/80 leading-snug">
                Conquer behavioral &amp; technical tracks. Master the STAR technique and handle curveball questions with calm authority.
              </p>
            </div>

            {/* Sticky 2: Butter Yellow */}
            <div className="bg-[#FEF08A] border-[2.5px] border-black rounded-2xl p-5 shadow-[5px_5px_0px_0px_#000] rotate-1 hover:rotate-0 hover:-translate-y-1 transition-all relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-purple-300/90 border border-black/40 rounded-sm -rotate-2" />
              <div className="flex items-center gap-3 mb-2 pt-1">
                <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_#000]">
                  🎤
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-black leading-tight">Presentations &amp; Pitches</h3>
                  <span className="text-[10px] font-bold text-black/70">All-Hands · Debates · Keynotes</span>
                </div>
              </div>
              <p className="text-xs font-bold text-black/80 leading-snug">
                Kill filler words (&quot;um&quot;, &quot;like&quot;) and nail your pacing with instant feedback and vocal variety scoring.
              </p>
            </div>

            {/* Sticky 3: Pastel Pink */}
            <div className="bg-[#FBCFE8] border-[2.5px] border-black rounded-2xl p-5 shadow-[5px_5px_0px_0px_#000] -rotate-2 hover:rotate-0 hover:-translate-y-1 transition-all relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-yellow-300/90 border border-black/40 rounded-sm rotate-1" />
              <div className="flex items-center gap-3 mb-2 pt-1">
                <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_#000]">
                  🔥
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-black leading-tight">Dates &amp; Social Banter</h3>
                  <span className="text-[10px] font-bold text-black/70">First Dates · Parties · Small Talk</span>
                </div>
              </div>
              <p className="text-xs font-bold text-black/80 leading-snug">
                Banish awkward silences forever. Practice storytelling, playful banter, and charismatic flow in a zero-judgment zone.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* ── Main Content Body (Offset for sticky cards) ────────────────────── */}
      <main className="flex-1 flex flex-col z-10 pt-24">

        {/* ── Why Rizzkey Section ──────────────────────────────────────────── */}
        <section className="px-6 md:px-12 max-w-5xl mx-auto w-full text-center pb-20">
          <div className="inline-flex items-center gap-2 bg-[#FEF08A] border-2 border-black px-3.5 py-1 rounded-full text-xs font-black text-black shadow-[2px_2px_0px_0px_#000] mb-4">
            <span>✨</span>
            <span>WHY RIZZKEY?</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black mb-4">
            Speaking Anxiety? Cured in Minutes.
          </h2>
          <p className="text-sm sm:text-base font-bold text-black/70 max-w-2xl mx-auto leading-relaxed">
            Most people practice speaking by making mistakes in front of real bosses or dates. Rizzkey gives you high-speed, realistic reps before you step onto the real stage.
          </p>
        </section>

        {/* ── Interactive Feature Demos (Neo-Brutalist Bento Grid) ─────────── */}
        <section id="training-modes" className="px-6 md:px-12 max-w-6xl mx-auto w-full pb-24">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#99F6E4] border-2 border-black px-3.5 py-1 rounded-full text-xs font-black text-black shadow-[2px_2px_0px_0px_#000] mb-3">
              <span>🎯</span>
              <span>CORE SUPERPOWERS</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black mb-3">
              Everything You Need to Sound Magnetic
            </h2>
            <p className="text-sm font-bold text-black/70 max-w-lg mx-auto">
              Real speech science, brutal honesty, and actionable cheat codes wrapped in zero boredom.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cell 1: Live Filler Word Stopper (Wide 2-col) */}
            <div className="md:col-span-2 bg-white border-[2.5px] border-black rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000] flex flex-col md:flex-row gap-6 justify-between items-center relative overflow-hidden">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#99F6E4] border-2 border-black flex items-center justify-center text-xl shadow-[3px_3px_0px_0px_#000] mb-4">
                    🎙️
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-2">
                    Real-Time Filler Word Stopper
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-black/70 leading-relaxed max-w-[34ch]">
                    Speak naturally. Rizzkey transcribes every syllable and highlights hesitations, nervous pauses, and filler crutches.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2">
                  <span className="bg-[#FEF08A] border-2 border-black px-3 py-1 rounded-xl text-xs font-black text-black shadow-[2px_2px_0px_0px_#000]">
                    98% Detection Accuracy
                  </span>
                </div>
              </div>

              {/* Visual Audio Wave & Annotation Mockup */}
              <div className="w-full md:w-[280px] bg-[#FAF8F5] border-2 border-black rounded-2xl p-4 font-mono text-xs flex flex-col gap-3 shadow-[3px_3px_0px_0px_#000] select-none">
                <div className="flex items-center justify-between border-b-2 border-black/10 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-black" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-black" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 border border-black" />
                  </div>
                  <span className="text-[10px] font-black text-black/60">LIVE TRANSCRIPT</span>
                </div>
                <div className="space-y-2 py-1">
                  <p className="text-[11px] font-bold text-black/80 leading-relaxed">
                    &quot;I believe that <span className="bg-red-400 border border-black text-white px-1.5 py-0.5 rounded font-black text-[10px]">um ✕</span> our strategy is <span className="bg-yellow-300 border border-black text-black px-1.5 py-0.5 rounded font-black text-[10px]">like ⚠️</span> completely sound.&quot;
                  </p>
                </div>
                <div className="bg-[#A7F3D0] border-2 border-black rounded-xl p-2 flex items-center justify-between text-[11px] font-black text-black">
                  <span>Filler Count: 2</span>
                  <span className="text-emerald-700">Pacing: 135 WPM</span>
                </div>
              </div>
            </div>

            {/* Cell 2: Charisma Scorecard (1-col) */}
            <div className="bg-[#DDD6FE] border-[2.5px] border-black rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-3 right-6 w-14 h-5 bg-yellow-300/90 border border-black/30 rounded-sm rotate-6" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black flex items-center justify-center text-xl shadow-[3px_3px_0px_0px_#000] mb-4">
                  🔥
                </div>
                <h3 className="text-xl font-black text-black tracking-tight mb-2">
                  The Charisma Scorecard
                </h3>
                <p className="text-xs sm:text-sm font-bold text-black/80 leading-relaxed mb-6">
                  Get a definitive score out of 100 on your vocal authority, pacing consistency, and lexical richness.
                </p>
              </div>
              <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_0px_#000] text-center">
                <div className="text-3xl sm:text-4xl font-black text-black">94<span className="text-lg text-black/50">/100</span></div>
                <div className="text-xs font-black text-emerald-600 mt-1 uppercase tracking-wide">Top 5% Magnetic Delivery</div>
              </div>
            </div>

            {/* Cell 3: Adaptive AI Personas (1-col) */}
            <div className="bg-[#FED7AA] border-[2.5px] border-black rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-3 right-6 w-14 h-5 bg-pink-300/90 border border-black/30 rounded-sm -rotate-3" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black flex items-center justify-center text-xl shadow-[3px_3px_0px_0px_#000] mb-4">
                  🎭
                </div>
                <h3 className="text-xl font-black text-black tracking-tight mb-2">
                  Pick Your Sparring Partner
                </h3>
                <p className="text-xs sm:text-sm font-bold text-black/80 leading-relaxed mb-6">
                  Practice against realistic AI personas: Tough Tech Lead, Casual Date, Speed Debater, or Supportive Coach.
                </p>
              </div>
              <div className="space-y-2">
                <div className="bg-white border-2 border-black rounded-xl p-2.5 flex items-center justify-between text-xs font-black shadow-[2px_2px_0px_0px_#000]">
                  <span>👔 Tough Executive</span>
                  <span className="text-[10px] bg-red-100 border border-black px-1.5 py-0.5 rounded">Hard</span>
                </div>
                <div className="bg-white border-2 border-black rounded-xl p-2.5 flex items-center justify-between text-xs font-black shadow-[2px_2px_0px_0px_#000]">
                  <span>☕ Casual First Date</span>
                  <span className="text-[10px] bg-emerald-100 border border-black px-1.5 py-0.5 rounded">Smooth</span>
                </div>
              </div>
            </div>

            {/* Cell 4: Gamified Roadmaps (Wide 2-col) */}
            <div className="md:col-span-2 bg-[#BAE6FD] border-[2.5px] border-black rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_0px_#000] flex flex-col md:flex-row gap-6 justify-between items-center relative overflow-hidden">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black flex items-center justify-center text-xl shadow-[3px_3px_0px_0px_#000] mb-4">
                  🗺️
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-2">
                  Level-by-Level Charisma Roadmaps
                </h3>
                <p className="text-xs sm:text-sm font-bold text-black/80 leading-relaxed max-w-[34ch]">
                  Unlock difficulty tiers, conquer speech milestones, and build streaks. Like Duolingo, but for your voice.
                </p>
              </div>
              <div className="w-full md:w-[300px] flex flex-col gap-2.5 select-none">
                <div className="bg-white border-2 border-black rounded-xl p-3 flex items-center gap-3 shadow-[3px_3px_0px_0px_#000]">
                  <span className="w-6 h-6 rounded-full bg-emerald-400 border border-black flex items-center justify-center font-black text-xs">✓</span>
                  <span className="text-xs font-black text-black truncate">Level 1: The 30s Hook</span>
                  <span className="text-[10px] bg-emerald-100 font-black px-1.5 py-0.5 rounded border border-black ml-auto">DONE</span>
                </div>
                <div className="bg-white border-2 border-black rounded-xl p-3 flex items-center gap-3 shadow-[3px_3px_0px_0px_#000]">
                  <span className="w-6 h-6 rounded-full bg-blue-400 border border-black flex items-center justify-center font-black text-xs animate-pulse">2</span>
                  <span className="text-xs font-black text-black truncate">Level 2: Storytelling Arc</span>
                  <span className="text-[10px] bg-blue-100 font-black px-1.5 py-0.5 rounded border border-black ml-auto">ACTIVE</span>
                </div>
                <div className="bg-white/80 border-2 border-black/60 rounded-xl p-3 flex items-center gap-3 shadow-[2px_2px_0px_0px_#000] opacity-80">
                  <span className="w-6 h-6 rounded-full bg-slate-200 border border-black/60 flex items-center justify-center font-black text-xs">🔒</span>
                  <span className="text-xs font-black text-black/70 truncate">Level 3: Negotiation Tactics</span>
                  <span className="text-[10px] bg-slate-100 font-black px-1.5 py-0.5 rounded border border-black/40 ml-auto">LOCKED</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── How it Works (3-Step Comic Flow) ─────────────────────────────── */}
        <section id="how-it-works" className="bg-[#FAF8F5] border-y-[3px] border-black py-20 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-white border-2 border-black px-3.5 py-1 rounded-full text-xs font-black text-black shadow-[2px_2px_0px_0px_#000] mb-3">
                <span>⚡</span>
                <span>HOW RIZZKEY WORKS</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight mb-3">
                3 Steps to Effortless Confidence
              </h2>
              <p className="text-sm sm:text-base font-bold text-black/70 max-w-lg mx-auto">
                No apps to download. No awkward video calls. Just you and your browser.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Step 1 */}
              <div className="bg-[#BAE6FD] border-[2.5px] border-black rounded-3xl p-7 shadow-[5px_5px_0px_0px_#000] relative">
                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_0px_#000] mb-5">
                  01
                </div>
                <h3 className="text-xl font-black text-black mb-2">Pick Your Scenario</h3>
                <p className="text-xs sm:text-sm font-bold text-black/80 leading-relaxed">
                  Choose from interview tracks, impromptu speeches, salary negotiations, or first date conversation starters.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#FEF08A] border-[2.5px] border-black rounded-3xl p-7 shadow-[5px_5px_0px_0px_#000] relative">
                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_0px_#000] mb-5">
                  02
                </div>
                <h3 className="text-xl font-black text-black mb-2">Speak for 60 Seconds</h3>
                <p className="text-xs sm:text-sm font-bold text-black/80 leading-relaxed">
                  Hit record and talk naturally. Rizzkey captures your audio with crystal-clear privacy-first local processing.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-[#A7F3D0] border-[2.5px] border-black rounded-3xl p-7 shadow-[5px_5px_0px_0px_#000] relative">
                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_0px_#000] mb-5">
                  03
                </div>
                <h3 className="text-xl font-black text-black mb-2">Get Your Cheat Codes</h3>
                <p className="text-xs sm:text-sm font-bold text-black/80 leading-relaxed">
                  Receive instant feedback on filler words, tone, vocabulary upgrades, and pacing tips. Watch your confidence 10x.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── Wall of Rizz (Testimonials) ──────────────────────────────────── */}
        <section id="wall-of-rizz" className="py-24 px-6 md:px-12 max-w-6xl mx-auto w-full">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#FBCFE8] border-2 border-black px-3.5 py-1 rounded-full text-xs font-black text-black shadow-[2px_2px_0px_0px_#000] mb-3">
              <span>⭐</span>
              <span>WALL OF RIZZ</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight mb-3">
              Real People. Zero Awkward Pauses.
            </h2>
            <p className="text-sm sm:text-base font-bold text-black/70 max-w-lg mx-auto">
              See how Rizzkey is turning nervous mumblers into effortlessly smooth communicators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Review 1 */}
            <div className="bg-[#FEF08A] border-[2.5px] border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] -rotate-1 hover:rotate-0 transition-transform relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-pink-300/90 border border-black/30 rounded-sm rotate-2" />
              <div className="flex text-amber-500 mb-3 pt-2">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 stroke-black stroke-[1.5]" />
                ))}
              </div>
              <p className="text-xs sm:text-sm font-bold text-black leading-relaxed mb-5">
                &quot;Landed my Google Associate Product Manager offer! Rizzkey killed my nervous &apos;umm-ing&apos; in 4 days. The instant breakdown on my structure was game-changing.&quot;
              </p>
              <div className="flex items-center gap-2 pt-2 border-t-2 border-black/10">
                <span className="w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center font-black text-xs">RK</span>
                <div>
                  <div className="text-xs font-black text-black">Rohan K.</div>
                  <div className="text-[10px] font-bold text-black/60">Associate PM @ Google</div>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-[#A7F3D0] border-[2.5px] border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] rotate-1 hover:rotate-0 transition-transform relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-purple-300/90 border border-black/30 rounded-sm -rotate-2" />
              <div className="flex text-amber-500 mb-3 pt-2">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 stroke-black stroke-[1.5]" />
                ))}
              </div>
              <p className="text-xs sm:text-sm font-bold text-black leading-relaxed mb-5">
                &quot;I used to sweat through my shirt on first dates. Practicing conversation starters on Rizzkey gave me so much easy banter. Went on a 2nd date for the first time in 6 months.&quot;
              </p>
              <div className="flex items-center gap-2 pt-2 border-t-2 border-black/10">
                <span className="w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center font-black text-xs">TM</span>
                <div>
                  <div className="text-xs font-black text-black">Tyler M.</div>
                  <div className="text-[10px] font-bold text-black/60">College Senior</div>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-[#FBCFE8] border-[2.5px] border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] -rotate-1 hover:rotate-0 transition-transform relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-yellow-300/90 border border-black/30 rounded-sm rotate-1" />
              <div className="flex text-amber-500 mb-3 pt-2">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 stroke-black stroke-[1.5]" />
                ))}
              </div>
              <p className="text-xs sm:text-sm font-bold text-black leading-relaxed mb-5">
                &quot;My filler words dropped from 42 down to 2 on my MBA capstone pitch. The pacing meter taught me how to actually breathe and pause for emphasis.&quot;
              </p>
              <div className="flex items-center gap-2 pt-2 border-t-2 border-black/10">
                <span className="w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center font-black text-xs">PS</span>
                <div>
                  <div className="text-xs font-black text-black">Priya S.</div>
                  <div className="text-[10px] font-bold text-black/60">MBA Candidate</div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── Neo-Brutalist Pricing ────────────────────────────────────────── */}
        <section id="pricing" className="bg-[#FAF8F5] border-t-[3px] border-black py-24 px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[#FFDE59] border-2 border-black px-3.5 py-1 rounded-full text-xs font-black text-black shadow-[2px_2px_0px_0px_#000] mb-3">
                <span>💰</span>
                <span>HONEST &amp; TRANSPARENT</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight mb-3">
                Simple Plans. Zero Hidden BS.
              </h2>
              <p className="text-sm sm:text-base font-bold text-black/70 max-w-md mx-auto">
                Start completely free. Upgrade only when you want unlimited reps and specialized coach personas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              
              {/* Free Plan */}
              <div className="bg-white border-[2.5px] border-black rounded-3xl p-8 shadow-[5px_5px_0px_0px_#000] flex flex-col justify-between">
                <div>
                  <div className="mb-4">
                    <span className="bg-slate-100 border-2 border-black px-3 py-1 rounded-xl text-xs font-black uppercase text-black">
                      Starter Plan
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-black mb-1">Free Forever</h3>
                  <p className="text-xs sm:text-sm font-bold text-black/60 mb-6">
                    Perfect for dipping your toes into speech coaching.
                  </p>
                  
                  <div className="text-4xl font-black text-black mb-6">
                    $0 <span className="text-sm font-bold text-black/60">/ forever</span>
                  </div>

                  <ul className="space-y-3 text-xs sm:text-sm font-bold text-black/80 mb-8">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      <span>3 speech evaluations daily</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      <span>Basic filler word counter</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      <span>Standard speech transcript</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-black/40">
                      <XIcon className="w-4 h-4 text-red-400 stroke-[3]" />
                      <span>History stored for 7 days</span>
                    </li>
                  </ul>
                </div>

                <Link href="/register" className="w-full">
                  <button className="neo-btn bg-white w-full py-3.5 rounded-2xl font-black text-sm text-black cursor-pointer">
                    [ Get Started Free ]
                  </button>
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="bg-[#FFDE59] border-[3px] border-black rounded-3xl p-8 shadow-[7px_7px_0px_0px_#000] flex flex-col justify-between relative">
                <div className="absolute -top-3.5 right-6 bg-[#99F6E4] border-2 border-black px-3 py-1 rounded-full text-[11px] font-black text-black shadow-[2px_2px_0px_0px_#000] uppercase tracking-wider">
                  Most Popular 🔥
                </div>
                <div>
                  <div className="mb-4">
                    <span className="bg-white border-2 border-black px-3 py-1 rounded-xl text-xs font-black uppercase text-black">
                      Rizzkey Pro
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-black mb-1">Unlimited Charisma</h3>
                  <p className="text-xs sm:text-sm font-bold text-black/70 mb-6">
                    Full unlocked access to every track, persona, and breakdown.
                  </p>
                  
                  <div className="text-4xl font-black text-black mb-6">
                    $15 <span className="text-sm font-bold text-black/60">/ month</span>
                  </div>

                  <ul className="space-y-3 text-xs sm:text-sm font-bold text-black mb-8">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-black stroke-[3.5]" />
                      <span>Unlimited speech evaluations</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-black stroke-[3.5]" />
                      <span>All 4 specialized AI Coach Personas</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-black stroke-[3.5]" />
                      <span>Full Interview &amp; Date Pathways</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-black stroke-[3.5]" />
                      <span>Deep lexical &amp; vocabulary upgrades</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-black stroke-[3.5]" />
                      <span>Lifetime history tracking</span>
                    </li>
                  </ul>
                </div>

                <Link href="/register" className="w-full">
                  <button className="neo-btn bg-[#99F6E4] w-full py-4 rounded-2xl font-black text-sm text-black cursor-pointer">
                    [ Unlock Your Charisma — Free Trial ]
                  </button>
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* ── Giant Bottom Call to Action Banner ────────────────────────────── */}
        <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto w-full">
          <div className="bg-[#FFDE59] border-[3px] border-black rounded-[32px] p-8 sm:p-14 text-center shadow-[8px_8px_0px_0px_#000] relative overflow-hidden">
            <div className="absolute top-4 left-6 text-2xl select-none animate-bounce">⚡</div>
            <div className="absolute bottom-4 right-6 text-2xl select-none animate-pulse">✨</div>
            
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight mb-4">
              Speak Smooth. Sound Smart. Zero Sweat.
            </h2>
            <p className="text-sm sm:text-base font-bold text-black/80 max-w-xl mx-auto mb-8">
              Join thousands of professionals, students, and daters who practice with Rizzkey to command every room they walk into.
            </p>

            <Link href={user ? "/dashboard" : "/register"} className="inline-block w-full sm:w-auto">
              <button className="neo-btn bg-[#99F6E4] px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg text-black w-full sm:w-auto cursor-pointer">
                [ Start Practicing Free — It Takes 30s ]
              </button>
            </Link>
            
            <div className="mt-4 text-xs font-black text-black/60">
              No credit card required ✦ 100% private in browser
            </div>
          </div>
        </section>

      </main>

      {/* ── Neo-Brutalist Footer ───────────────────────────────────────────── */}
      <footer className="bg-black text-white border-t-[3px] border-black py-14 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          
          {/* Logo & Tagline */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white text-black border-2 border-black rounded-xl px-3 py-1 font-black text-lg shadow-[2px_2px_0px_0px_#FFDE59] mb-3">
              <span>🔑</span>
              <span>Rizzkey</span>
            </div>
            <p className="text-xs font-bold text-zinc-400 max-w-xs">
              The AI speaking coach that turns nervous mumblers into effortlessly smooth communicators.
            </p>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap justify-center gap-6 text-xs font-black text-zinc-300">
            <a href="#how-it-works" className="hover:text-yellow-300 transition-colors">How it Works</a>
            <a href="#training-modes" className="hover:text-yellow-300 transition-colors">Training Modes</a>
            <a href="#wall-of-rizz" className="hover:text-yellow-300 transition-colors">Wall of Rizz</a>
            <a href="#pricing" className="hover:text-yellow-300 transition-colors">Pricing</a>
            <Link href="/login" className="hover:text-yellow-300 transition-colors">Log In</Link>
            <Link href="/register" className="hover:text-yellow-300 transition-colors">Sign Up</Link>
          </div>

          {/* Badge & Copyright */}
          <div className="text-xs text-zinc-400 font-bold flex flex-col items-center md:items-end gap-1.5">
            <span className="bg-[#FFDE59] text-black px-2 py-0.5 rounded text-[10px] font-black">
              100% Free of Awkward Pauses 🛡️
            </span>
            <span>© {new Date().getFullYear()} Rizzkey. All rights reserved.</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
