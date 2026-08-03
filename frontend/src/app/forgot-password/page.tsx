"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { supabase } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090b] px-4 py-12 font-sans relative overflow-hidden theme-dark dark">
      {/* Background glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[150px] pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-md p-[1px] rounded-2xl bg-gradient-to-b from-zinc-800 to-transparent shadow-2xl z-10 anim-scalein">
        <div className="w-full bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800/60 rounded-[15px] p-8 space-y-6">
          <div className="text-center space-y-3">
            <Link href="/" className="inline-block">
              <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 select-none hover:scale-105 transition-transform">
                S
              </div>
            </Link>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight text-zinc-100">Reset Your Password</CardTitle>
              <CardDescription className="text-xs text-zinc-400 mt-1.5 font-medium leading-relaxed uppercase tracking-wider">
                We will email you password recovery instructions
              </CardDescription>
            </div>
          </div>

          <div className="p-0 space-y-5">
            {errorMsg && (
              <div className="p-3.5 bg-red-950/40 border border-red-900/50 rounded-xl text-xs font-semibold text-red-400 anim-fadeup">
                {errorMsg}
              </div>
            )}

            {submitted ? (
              <div className="p-6 bg-emerald-950/30 border border-emerald-900/50 rounded-2xl text-center space-y-3 anim-fadeup">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-emerald-300">Reset Email Sent!</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  We sent a recovery link to <span className="font-bold text-white">{email}</span>. Please check your inbox and click the link to reset your password.
                </p>
                <Link href="/login" className="inline-block pt-2">
                  <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-semibold border-zinc-800 text-zinc-200">
                    Back to Log In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm h-11 mt-2 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                >
                  {loading ? "Sending link..." : "Send Reset Link"}
                </Button>
              </form>
            )}

            <div className="text-center pt-2">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 font-semibold transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
