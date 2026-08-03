"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { user, supabase, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If user is already logged in, redirect them to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    if (!supabase) return;
    setOauthLoading(provider);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to sign in with ${provider}.`);
      setOauthLoading(null);
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"/>
          <p className="text-xs text-zinc-400 font-semibold tracking-wide">Verifying session...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090b] px-4 py-12 font-sans relative overflow-hidden theme-dark dark">
      {/* Sleek professional background glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[150px] pointer-events-none" />
      
      {/* Subtly animated grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-md p-[1px] rounded-2xl bg-gradient-to-b from-zinc-800 to-transparent shadow-2xl z-10 anim-scalein">
        <div className="w-full bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800/60 rounded-[15px] p-8 space-y-6">
          <div className="text-center space-y-3">
            {/* Logo */}
            <Link href="/" className="inline-block">
              <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 select-none hover:scale-105 transition-transform">
                S
              </div>
            </Link>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight text-zinc-100">Welcome Back</CardTitle>
              <CardDescription className="text-xs text-zinc-400 mt-1.5 font-medium leading-relaxed uppercase tracking-wider">
                Evaluate & Perfect Your Speech
              </CardDescription>
            </div>
          </div>

          <div className="p-0 space-y-5">
            {errorMsg && (
              <div className="p-3.5 bg-red-950/40 border border-red-900/50 rounded-xl text-xs font-semibold text-red-400 anim-fadeup">
                {errorMsg}
              </div>
            )}

            {/* Social OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={!!oauthLoading || loading}
                onClick={() => handleOAuthLogin("google")}
                className="h-11 border-zinc-800 bg-zinc-950/80 hover:bg-zinc-800/60 text-zinc-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2.5"
              >
                {oauthLoading === "google" ? (
                  <span className="w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"/>
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                )}
                <span>Google</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={!!oauthLoading || loading}
                onClick={() => handleOAuthLogin("github")}
                className="h-11 border-zinc-800 bg-zinc-950/80 hover:bg-zinc-800/60 text-zinc-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2.5"
              >
                {oauthLoading === "github" ? (
                  <span className="w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"/>
                ) : (
                  <svg className="w-4 h-4 shrink-0 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                )}
                <span>GitHub</span>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-zinc-800 w-full" />
              <span className="bg-zinc-900 px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider absolute">
                Or email
              </span>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-sm h-11 border-zinc-800 bg-zinc-950/80 text-zinc-100 placeholder:text-zinc-600 rounded-xl transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                    Password
                  </Label>
                  <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-sm h-11 border-zinc-800 bg-zinc-950/80 text-zinc-100 placeholder:text-zinc-600 rounded-xl transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !!oauthLoading}
                className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm h-11 mt-2 rounded-xl transition-all shadow-lg shadow-blue-500/20"
              >
                {loading ? "Signing in..." : "Log In"}
              </Button>
            </form>

            <div className="text-center text-xs text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 hover:underline font-semibold transition-all ml-1">
                Sign up free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
