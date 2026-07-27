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
        <div className="w-full bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800/50 rounded-[15px] p-8 space-y-6">
          <div className="text-center space-y-3">
            {/* Logo */}
            <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 select-none">
              S
            </div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight text-zinc-100">Welcome Back</CardTitle>
              <CardDescription className="text-xs text-zinc-400 mt-1.5 font-medium leading-relaxed uppercase tracking-wider">
                Evaluate & Perfect Your Speech
              </CardDescription>
            </div>
          </div>

          <div className="p-0 space-y-6">
            {errorMsg && (
              <div className="p-3.5 bg-red-950/40 border border-red-900/50 rounded-xl text-xs font-semibold text-red-400 anim-fadeup">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                  Password
                </Label>
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
                disabled={loading}
                className="w-full bg-primary text-primary-foreground font-semibold text-sm h-11 mt-2 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/10 hover:shadow-primary/20"
              >
                {loading ? "Signing in..." : "Log In"}
              </Button>
            </form>

            <div className="text-center text-sm text-zinc-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 hover:underline font-semibold transition-all ml-1">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
