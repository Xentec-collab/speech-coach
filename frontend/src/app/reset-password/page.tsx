"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { supabase } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update password.");
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
              <CardTitle className="text-2xl font-bold tracking-tight text-zinc-100">Set New Password</CardTitle>
              <CardDescription className="text-xs text-zinc-400 mt-1.5 font-medium leading-relaxed uppercase tracking-wider">
                Enter your new password below to update your account
              </CardDescription>
            </div>
          </div>

          <div className="p-0 space-y-5">
            {errorMsg && (
              <div className="p-3.5 bg-red-950/40 border border-red-900/50 rounded-xl text-xs font-semibold text-red-400 anim-fadeup">
                {errorMsg}
              </div>
            )}

            {success ? (
              <div className="p-6 bg-emerald-950/30 border border-emerald-900/50 rounded-2xl text-center space-y-3 anim-fadeup">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-emerald-300">Password Updated Successfully!</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Redirecting you to your dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                    New Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-sm h-12 border-zinc-800 bg-zinc-950/80 text-zinc-100 placeholder:text-zinc-600 rounded-xl transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="text-sm h-12 border-zinc-800 bg-zinc-950/80 text-zinc-100 placeholder:text-zinc-600 rounded-xl transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm h-12 mt-2 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                >
                  {loading ? "Updating password..." : "Update Password"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
