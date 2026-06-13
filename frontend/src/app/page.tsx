"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-[#121113] flex flex-col font-sans text-[#D0D2F1] selection:bg-[#FFB7C3]/20 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#D0D2F1]/3 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#FFB7C3]/3 blur-[130px] pointer-events-none" />

      {/* Navbar */}
      <header className="h-16 px-6 md:px-12 flex items-center justify-between border-b border-[#899878]/10 bg-[#121113]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D0D2F1] to-[#FFB7C3] flex items-center justify-center text-[#121113] font-black text-sm shadow-md shadow-[#FFB7C3]/10 select-none">
            S
          </div>
          <span className="font-black text-lg tracking-tight text-[#D0D2F1]">
            SpeakAI <span className="text-[#FFB7C3]">Coach</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          {loading ? (
            <span className="text-xs text-[#899878] font-medium tracking-wide">Checking session...</span>
          ) : user ? (
            <Link href="/dashboard">
              <Button size="sm" className="bg-gradient-to-r from-[#D0D2F1] to-[#FFB7C3] text-[#121113] font-bold shadow-md shadow-[#FFB7C3]/10 hover:opacity-90 transition-all">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-[#899878] hover:text-[#D0D2F1] font-bold uppercase tracking-wider text-[10px] transition-all">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-gradient-to-r from-[#D0D2F1] to-[#FFB7C3] text-[#121113] font-bold shadow-md shadow-[#FFB7C3]/10 hover:opacity-90 transition-all">
                  Sign Up Free
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col z-10">
        <section className="relative py-20 md:py-32 px-6 md:px-12 text-center max-w-4xl mx-auto flex flex-col items-center">
          
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#FFB7C3]/5 border border-[#FFB7C3]/20 text-[#FFB7C3] uppercase tracking-widest mb-8">
            ✨ Interactive AI-Powered Speech Training
          </span>
          
          <h1 className="text-4xl md:text-6xl font-black text-[#D0D2F1] tracking-tight leading-[1.1] mb-6">
            Master the Art of <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#D0D2F1] to-[#FFB7C3] bg-clip-text text-transparent">
              Public Speaking
            </span>
          </h1>
          
          <p className="text-sm md:text-base text-[#899878] max-w-2xl leading-relaxed mb-10 font-semibold">
            Record speeches, receive instant structure-first AI feedback on clarity, fluency, and lexicon. Track metrics over time with interactive dashboards.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xs sm:max-w-none">
            {user ? (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="bg-gradient-to-r from-[#D0D2F1] to-[#FFB7C3] text-[#121113] font-extrabold px-8 shadow-lg shadow-[#FFB7C3]/15 w-full h-12 rounded-xl hover:opacity-90 transition-all">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-gradient-to-r from-[#D0D2F1] to-[#FFB7C3] text-[#121113] font-extrabold px-8 shadow-lg shadow-[#FFB7C3]/15 w-full h-12 rounded-xl hover:opacity-90 transition-all">
                    Start Practicing Free
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="border-[#899878]/30 bg-[#222725] text-[#D0D2F1] hover:bg-[#121113] hover:text-[#FFB7C3] w-full h-12 rounded-xl font-bold transition-all">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="px-6 md:px-12 max-w-6xl mx-auto w-full pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-[1px] rounded-2xl bg-gradient-to-br from-[#D0D2F1]/10 to-[#FFB7C3]/5 hover:from-[#D0D2F1]/30 hover:to-[#FFB7C3]/20 transition-all duration-300 shadow-xl">
              <Card className="border-none bg-[#222725] h-full rounded-[15px] p-6 flex flex-col justify-between">
                <div>
                  <CardHeader className="p-0 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D0D2F1]/10 to-[#FFB7C3]/10 flex items-center justify-center text-[#FFB7C3] border border-[#FFB7C3]/20 mb-4 shadow-sm shadow-[#FFB7C3]/5">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                    </div>
                    <CardTitle className="text-lg font-black text-[#D0D2F1] tracking-tight">Practice Terminal</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-xs text-[#899878] leading-relaxed font-semibold">
                      Record directly in your browser with real-time feedback. Includes integrated timers, pause options, and immediate audio transcription.
                    </p>
                  </CardContent>
                </div>
              </Card>
            </div>

            {/* Feature 2 */}
            <div className="p-[1px] rounded-2xl bg-gradient-to-br from-[#D0D2F1]/10 to-[#FFB7C3]/5 hover:from-[#D0D2F1]/30 hover:to-[#FFB7C3]/20 transition-all duration-300 shadow-xl">
              <Card className="border-none bg-[#222725] h-full rounded-[15px] p-6 flex flex-col justify-between">
                <div>
                  <CardHeader className="p-0 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D0D2F1]/10 to-[#FFB7C3]/10 flex items-center justify-center text-[#D0D2F1] border border-[#D0D2F1]/20 mb-4 shadow-sm shadow-[#D0D2F1]/5">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                    </div>
                    <CardTitle className="text-lg font-black text-[#D0D2F1] tracking-tight">Structure-First Feedback</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-xs text-[#899878] leading-relaxed font-semibold">
                      Get scored on clarity, pacing, grammar, content structure, and vocabulary. Automatically highlights and flags common filler words.
                    </p>
                  </CardContent>
                </div>
              </Card>
            </div>

            {/* Feature 3 */}
            <div className="p-[1px] rounded-2xl bg-gradient-to-br from-[#D0D2F1]/10 to-[#FFB7C3]/5 hover:from-[#D0D2F1]/30 hover:to-[#FFB7C3]/20 transition-all duration-300 shadow-xl">
              <Card className="border-none bg-[#222725] h-full rounded-[15px] p-6 flex flex-col justify-between">
                <div>
                  <CardHeader className="p-0 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D0D2F1]/10 to-[#FFB7C3]/10 flex items-center justify-center text-[#899878] border border-[#899878]/20 mb-4 shadow-sm shadow-[#899878]/5">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
                    </div>
                    <CardTitle className="text-lg font-black text-[#D0D2F1] tracking-tight">Cohesive Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-xs text-[#899878] leading-relaxed font-semibold">
                      Visualize improvement analytics, best scores, streak calendars, and vocabulary upgrades. Includes dual theme skins for customization.
                    </p>
                  </CardContent>
                </div>
              </Card>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-[#899878]/10 text-center text-xs text-[#899878] bg-[#222725]/40 z-10">
        <p>© {new Date().getFullYear()} SpeakAI Coach. Built for confident communication.</p>
      </footer>
    </div>
  );
}
