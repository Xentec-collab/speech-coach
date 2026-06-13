"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      <main className="min-h-screen flex items-center justify-center bg-[#fffdf9]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-[#fb7185]/20 border-t-[#fb7185] rounded-full animate-spin"/>
          <p className="text-xs text-[#2d5a37]/80 font-bold tracking-wide">Verifying session...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#fffdf9] via-[#fef3e9] to-[#ffe4e6] px-4 py-12 font-sans relative overflow-hidden theme-cute">
      {/* Soft light spots (blobs) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#fef9c3]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#fbcfe8]/15 blur-[120px] pointer-events-none" />

      {/* Drifting leaves and flower petals in the background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Leaf 1 */}
        <svg className="absolute w-5 h-5 text-[#568764]/15 animate-float-leaf top-[15%] left-[25%]" style={{ "--duration": "14s", "--delay": "0s" } as any} viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 2c-5.5 0-10 4.5-10 10 0 1.2.2 2.3.6 3.4L2 22l6.6-.6c1.1.4 2.2.6 3.4.6 5.5 0 10-4.5 10-10V2h-1z" />
        </svg>
        {/* Leaf 2 */}
        <svg className="absolute w-6 h-6 text-[#2d5a37]/10 animate-float-leaf top-[65%] left-[75%]" style={{ "--duration": "18s", "--delay": "4s" } as any} viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 2c-5.5 0-10 4.5-10 10 0 1.2.2 2.3.6 3.4L2 22l6.6-.6c1.1.4 2.2.6 3.4.6 5.5 0 10-4.5 10-10V2h-1z" />
        </svg>
        {/* Petal 1 */}
        <svg className="absolute w-4 h-4 text-[#eab308]/20 animate-float-flower top-[35%] right-[20%]" style={{ "--duration": "15s", "--delay": "1s" } as any} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C9.5 5 9.5 9.5 12 12c2.5-2.5 2.5-7 0-10z" />
        </svg>
        {/* Petal 2 */}
        <svg className="absolute w-3.5 h-3.5 text-[#fbbf24]/15 animate-float-flower top-[75%] left-[15%]" style={{ "--duration": "12s", "--delay": "5s" } as any} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C9.5 5 9.5 9.5 12 12c2.5-2.5 2.5-7 0-10z" />
        </svg>
      </div>

      {/* Card container with a 1px cozy border */}
      <div className="relative w-full max-w-md p-[1px] rounded-2xl bg-gradient-to-br from-[#fbbf24]/30 via-[rgba(21,46,27,0.15)] to-[#fb7185]/30 shadow-2xl z-10">
        <Card className="w-full bg-white/45 backdrop-blur-xl border border-[rgba(86,135,100,0.18)] rounded-[15px] p-6 space-y-6">
          <CardHeader className="text-center space-y-3 p-0 pt-2">
            {/* Logo Badge */}
            <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-[#fbbf24] to-[#fb7185] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#fb7185]/10 select-none animate-float-flower" style={{ "--duration": "10s" } as any}>
              S
            </div>
            <div>
              <CardTitle className="text-2xl font-black tracking-tight text-[#112615]">Welcome Back</CardTitle>
              <CardDescription className="text-xs text-[#2d5a37]/80 mt-1.5 font-extrabold tracking-wide leading-relaxed uppercase">
                Evaluate & Perfect Your Speech
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0 space-y-6">
            {errorMsg && (
              <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] text-[#2d5a37]/80 font-extrabold uppercase tracking-wider">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-sm h-11 border-[rgba(21,46,27,0.18)] bg-white/60 text-[#112615] placeholder:text-[#2d5a37]/35 focus-visible:ring-[#fb7185] rounded-lg transition-all focus:border-[#fb7185]/50"
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[10px] text-[#2d5a37]/80 font-extrabold uppercase tracking-wider">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-sm h-11 border-[rgba(21,46,27,0.18)] bg-white/60 text-[#112615] placeholder:text-[#2d5a37]/35 focus-visible:ring-[#fb7185] rounded-lg transition-all focus:border-[#fb7185]/50"
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#fb7185] text-white font-extrabold text-sm h-11 mt-4 rounded-lg hover:bg-[#f43f5e] transition-all shadow-md shadow-[#fb7185]/15 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? "Signing in..." : "Log In"}
              </Button>
            </form>

            <div className="text-center text-xs text-[#2d5a37]/75">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#fb7185] hover:underline font-bold transition-all ml-1">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
