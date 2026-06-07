"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-slate-50 px-6 py-10">
      <section className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 px-3 py-1 bg-brand-50 rounded-full">
          AI Public Speaking Coach SaaS
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Master the Art of Public Speaking
        </h1>
        <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-lg mx-auto">
          Record speeches, receive detailed AI feedback, track progress metrics, and become a confident presenter.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          {loading ? (
            <span className="text-sm text-slate-500">Checking session...</span>
          ) : user ? (
            <Link
              href="/dashboard"
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2.5 px-6 rounded transition-colors shadow-sm"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2.5 px-6 rounded transition-colors shadow-sm"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold py-2.5 px-6 rounded transition-colors"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
