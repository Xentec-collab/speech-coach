"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, session, supabase, loading } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<string | null>(null);

  // Protected route logic
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Extract access token for display/testing
  useEffect(() => {
    if (session) {
      setAccessToken(session.access_token);
    } else {
      setAccessToken(null);
    }
  }, [session]);

  const handleLogout = async () => {
    if (!supabase) return;
    setLogoutLoading(true);
    try {
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLogoutLoading(false);
    }
  };

  const testBackendTokenVerification = async () => {
    if (!session) return;
    setBackendStatus("Testing verification...");
    try {
      const response = await fetch("http://localhost:8000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setBackendStatus(`Verified! ID: ${data.id}, Email: ${data.email}`);
    } catch (err: any) {
      setBackendStatus(`Failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-600 rounded flex items-center justify-center text-white font-bold">
              SC
            </div>
            <span className="font-bold text-lg text-slate-900">SpeechCoach</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600">{user.email}</span>
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1.5 px-3 rounded transition-colors disabled:opacity-50"
            >
              {logoutLoading ? "Logging out..." : "Log Out"}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome to your Dashboard</h1>
          <p className="text-slate-500 mt-2">
            Practice speeches, analyze transcripts, and track your metrics.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <section className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm col-span-1">
            <h2 className="font-bold text-slate-900 mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">User ID</p>
                <p className="text-slate-700 font-mono break-all">{user.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Email</p>
                <p className="text-slate-700">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Created At</p>
                <p className="text-slate-700">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </section>

          {/* Backend Verification Playground */}
          <section className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm col-span-2">
            <h2 className="font-bold text-slate-900 mb-4">Backend Connection & JWT Verification</h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Verify that the Next.js frontend can communicate with the FastAPI backend. You can trigger a live verification call using your Supabase JWT.
            </p>

            {accessToken && (
              <div className="mb-4">
                <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Your JWT (First 50 chars)</p>
                <p className="text-xs font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 break-all">
                  {accessToken.slice(0, 50)}...
                </p>
              </div>
            )}

            <button
              onClick={testBackendTokenVerification}
              className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold py-2 px-4 rounded transition-colors"
            >
              Test Auth Token on Backend
            </button>

            {backendStatus && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded font-mono text-xs text-slate-700">
                {backendStatus}
              </div>
            )}
          </section>
        </div>

        {/* Feature Placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white border border-slate-200 border-dashed rounded-lg p-8 text-center">
            <h3 className="font-bold text-slate-400 mb-2">Speak & Record</h3>
            <p className="text-sm text-slate-400">Generate a speaking topic and record your speech to get instant evaluation.</p>
            <div className="mt-4 inline-block px-3 py-1 bg-slate-100 rounded text-xs text-slate-500 font-semibold">
              Coming in Next Feature Task
            </div>
          </div>

          <div className="bg-white border border-slate-200 border-dashed rounded-lg p-8 text-center">
            <h3 className="font-bold text-slate-400 mb-2">Speech History</h3>
            <p className="text-sm text-slate-400">View your previous speeches, scores, feedback logs, and track overall progress.</p>
            <div className="mt-4 inline-block px-3 py-1 bg-slate-100 rounded text-xs text-slate-500 font-semibold">
              Coming in Next Feature Task
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
