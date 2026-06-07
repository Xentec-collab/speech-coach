"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface GeneratedTopic {
  title: string;
  prompt: string;
  context: string;
  suggested_points: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, session, supabase, loading } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<string | null>(null);

  // Topic Generator State
  const [category, setCategory] = useState("impromptu");
  const [difficulty, setDifficulty] = useState("medium");
  const [customTopic, setCustomTopic] = useState("");
  const [topics, setTopics] = useState<GeneratedTopic[]>([]);
  const [topicLoading, setTopicLoading] = useState(false);
  const [topicError, setTopicError] = useState<string | null>(null);
  
  // Guide State
  const [showGuide, setShowGuide] = useState(false);

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

  const handleGenerateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setTopicLoading(true);
    setTopicError(null);

    try {
      let url = `http://localhost:8000/api/topics/generate?category=${category}&difficulty=${difficulty}`;
      if (customTopic.trim()) {
        url += `&custom_topic=${encodeURIComponent(customTopic.trim())}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data && data.topics) {
        setTopics(data.topics);
      }
    } catch (err: any) {
      setTopicError(err.message || "Failed to generate topic.");
    } finally {
      setTopicLoading(false);
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

  // Get active topic (index 0) for display
  const activeTopic = topics.length > 0 ? topics[0] : null;

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

        {/* Section 1: Setup & Tests */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

            <div className="flex gap-2">
              <button
                onClick={testBackendTokenVerification}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold py-2 px-4 rounded transition-colors"
              >
                Test Auth Token on Backend
              </button>
            </div>

            {backendStatus && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded font-mono text-xs text-slate-700">
                {backendStatus}
              </div>
            )}
          </section>
        </div>

        {/* Section 2: Topic Generator */}
        <section className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <h2 className="text-xl font-bold text-slate-900">AI Speaking Topic Generator</h2>
            <button
              onClick={() => setShowGuide(!showGuide)}
              title="View Guide"
              className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors border border-slate-200"
            >
              ?
            </button>
          </div>
          
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Generate a custom topic using Gemini. You can let the AI generate a random topic, or provide your own theme and have Gemini build structured coaching materials around it.
          </p>

          {showGuide && (
            <div className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 space-y-4">
              <h3 className="font-bold text-slate-900">Guide & Descriptions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Own Topic or Theme (Optional)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Type a custom theme (e.g., a presentation topic you are preparing for work) to have Gemini build custom coaching guidelines, scenario contexts, and talking points specifically for that topic. If left blank, the AI generates a random prompt.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Categories</h4>
                  <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                    <li>
                      <strong>Impromptu Speaking:</strong> Practice thinking on your feet. Generates abstract or creative prompts with no preparation time.
                    </li>
                    <li>
                      <strong>Job Interview Practice:</strong> Practice behavioral questions to prepare for real-world hiring processes.
                    </li>
                    <li>
                      <strong>Persuasive Argument:</strong> Practice structuring analytical arguments to convince or sway an audience.
                    </li>
                    <li>
                      <strong>Icebreaker & Warmup:</strong> Low-pressure, lighthearted topics to warm up your voice.
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Difficulty</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Determines the conceptual complexity and analytical depth required to address the prompt. Easy prompts are straightforward and personal; Hard prompts require structured, multi-dimensional answers.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleGenerateTopic} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1" htmlFor="customTopic">
                Own Topic or Theme (Optional)
              </label>
              <input
                id="customTopic"
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. Benefits of a four-day work week, or why learning history matters"
                className="w-full px-3 py-2 border border-slate-300 rounded text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1" htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="impromptu">Impromptu Speaking</option>
                  <option value="interview">Job Interview Practice</option>
                  <option value="persuasive">Persuasive Argument</option>
                  <option value="warmup">Icebreaker & Warmup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1" htmlFor="difficulty">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={topicLoading}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
                >
                  {topicLoading ? "Generating Topic..." : "Generate speaking prompt"}
                </button>
              </div>
            </div>
          </form>

          {topicError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600 mb-6">
              {topicError}
            </div>
          )}

          {activeTopic && (
            <div className="border border-brand-100 bg-brand-50/20 rounded-lg p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-900">{activeTopic.title}</h3>
                <span className="text-xs bg-brand-100 text-brand-700 font-semibold px-2 py-0.5 rounded capitalize">
                  {difficulty}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Speaking Prompt</p>
                  <p className="text-slate-800 text-sm mt-1 leading-relaxed font-medium">{activeTopic.prompt}</p>
                </div>
                
                {activeTopic.context && (
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Scenario Context</p>
                    <p className="text-slate-600 text-sm mt-1 leading-relaxed">{activeTopic.context}</p>
                  </div>
                )}
                
                {activeTopic.suggested_points && activeTopic.suggested_points.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Suggested Talking Points</p>
                    <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                      {activeTopic.suggested_points.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Section 3: Feature Placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 border-dashed rounded-lg p-8 text-center">
            <h3 className="font-bold text-slate-400 mb-2">Speech Recording</h3>
            <p className="text-sm text-slate-400">Record your speech directly in the browser to receive transcription and coaching feedback.</p>
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
