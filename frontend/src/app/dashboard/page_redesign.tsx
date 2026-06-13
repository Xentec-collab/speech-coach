"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// ── Types ─────────────────────────────────────────────────────────────────────
interface GeneratedTopic {
  id?: string;
  title: string;
  prompt: string;
  context: string;
  suggested_points: string[];
}
interface LexiconSuggestion {
  original_word: string;
  suggested_replacement: string;
  explanation: string;
}
interface SpeechFeedback {
  written_feedback: string;
  lexicon_suggestions?: LexiconSuggestion[];
  counter_argument?: string;
  challenge_questions?: string[];
}
interface SpeechHistoryItem {
  id: string;
  user_id: string;
  topic_id: string | null;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  duration_seconds: number;
  status: "uploaded" | "transcribing" | "analyzing" | "completed" | "failed";
  transcript: string | null;
  feedback: SpeechFeedback | null;
  overall_score: number | null;
  pronunciation_score: number | null;
  fluency_score: number | null;
  grammar_score: number | null;
  content_score: number | null;
  lexicon_score: number | null;
  retry_count: number;
  created_at: string;
  topics?: GeneratedTopic | null;
}
interface SpeechStatistics {
  total_speeches: number;
  completed_speeches: number;
  average_overall_score: number;
  best_overall_score: number;
  latest_overall_score: number;
  average_lexicon_score?: number;
  best_lexicon_score?: number;
  latest_lexicon_score?: number;
  score_delta_first: number;
  score_delta_prev: number;
  percent_improvement: number;
  current_streak: number;
  longest_streak: number;
  is_cute_mode?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const renderMarkdown = (text: string) => {
  if (!text) return "";
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
      : part
  );
};

const scoreColor = (s: number | null) => {
  if (s === null) return "#94a3b8";
  if (s >= 85) return "#059669";
  if (s >= 70) return "#4f46e5";
  return "#d97706";
};

const scoreBadgeClass = (s: number | null) => {
  if (s === null) return "badge badge-slate";
  if (s >= 85) return "badge badge-emerald";
  if (s >= 70) return "badge badge-indigo";
  return "badge badge-amber";
};

// ── Score Dial SVG ─────────────────────────────────────────────────────────────
function ScoreDial({ score, cute }: { score: number | null; cute: boolean }) {
  const pct = score ?? 0;
  const r = 42, circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const label = pct >= 90 ? "Exceptional" : pct >= 80 ? "Excellent" : pct >= 70 ? "Good" : pct >= 60 ? "Fair" : "Developing";
  const ringColor = cute ? "#f472b6" : "#4f46e5";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
        <svg viewBox="0 0 100 100" style={{ width: 80, height: 80, transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={ringColor} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 20, color: "var(--text-main)" }}>
          {score ?? "—"}
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text-main)" }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--text-sub)", marginTop: 2 }}>Overall Score / 100</div>
      </div>
    </div>
  );
}

// ── Skill Bar ──────────────────────────────────────────────────────────────────
function SkillBar({ label, score, cute }: { label: string; score: number | null; cute: boolean }) {
  const color = cute ? "#f472b6" : scoreColor(score);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
      <span style={{ width: 130, fontSize: 12, color: "var(--text-sub)", flexShrink: 0 }}>{label}</span>
      <div className="progress-track" style={{ flex: 1 }}>
        <div className="progress-fill" style={{ width: `${score ?? 0}%`, background: color }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, width: 28, textAlign: "right" }}>{score ?? "—"}</span>
    </div>
  );
}

// ── Waveform ───────────────────────────────────────────────────────────────────
function Waveform({ active, cute }: { active: boolean; cute: boolean }) {
  const heights = [12,20,28,16,32,24,18,30,22,14,28,20,12,26,32,18,24,16,30,20,14,28,22,18,32,16,24,20,12,26,28,20,14,30,22,18,16,24,32,20];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, height: 48, padding: "0 8px", background: "#f8fafc", borderRadius: 6, width: "100%" }}>
      {heights.map((h, i) => (
        <div key={i} className={active ? "wave-bar" : ""} style={{
          width: 3, height: h, borderRadius: 2, background: cute ? "#f9a8d4" : "#818cf8",
          opacity: active ? 1 : 0.35,
          animationDelay: active ? `${i * 0.03}s` : "0s",
          flexShrink: 0,
        }} />
      ))}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, cute }: { label: string; value: string; sub?: string; cute: boolean }) {
  return (
    <div className="card" style={{ padding: "16px 20px" }}>
      <div className="label-xs" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: cute ? "#be185d" : "#4f46e5", letterSpacing: "-0.01em" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-meta)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { user, session, supabase, loading } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Topic Generator State
  const [category, setCategory] = useState("impromptu");
  const [difficulty, setDifficulty] = useState("medium");
  const [customTopic, setCustomTopic] = useState("");
  const [topics, setTopics] = useState<GeneratedTopic[]>([]);
  const [topicLoading, setTopicLoading] = useState(false);
  const [topicError, setTopicError] = useState<string | null>(null);

  // Audio Recorder State
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "paused" | "stopped">("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Polling & Analysis State
  const [polledSpeechId, setPolledSpeechId] = useState<string | null>(null);
  const [polledSpeechDetails, setPolledSpeechDetails] = useState<SpeechHistoryItem | null>(null);

  // History & Statistics State
  const [historyList, setHistoryList] = useState<SpeechHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [stats, setStats] = useState<SpeechStatistics | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<"practice" | "analytics" | "history">("practice");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const pollingIntervalRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const stopRecordingAndStream = (recorder?: MediaRecorder | null, stream?: MediaStream | null) => {
    const r = recorder || mediaRecorderRef.current;
    const s = stream || streamRef.current;
    if (r && r.state !== "inactive") r.stop();
    if (s) s.getTracks().forEach(t => t.stop());
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    setRecordingState("stopped");
  };

  const startRecording = async () => {
    setUploadError(null);
    setUploadSuccess(false);
    audioChunksRef.current = [];
    setRecordSeconds(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { noiseSuppression: true, echoCancellation: true, autoGainControl: true } });
      streamRef.current = stream;
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) mimeType = "audio/webm;codecs=opus";
      else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) mimeType = "audio/ogg;codecs=opus";
      else if (MediaRecorder.isTypeSupported("audio/mp4")) mimeType = "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };
      recorder.start(250);
      setRecordingState("recording");
      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds(prev => { if (prev >= 300) { stopRecordingAndStream(recorder, stream); return 300; } return prev + 1; });
      }, 1000);
    } catch (err: any) {
      setUploadError("Could not access your microphone. Please verify permissions.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setRecordingState("paused");
      if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setRecordingState("recording");
      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds(prev => { if (prev >= 300) { stopRecordingAndStream(); return 300; } return prev + 1; });
      }, 1000);
    }
  };

  const discardRecording = () => {
    stopRecordingAndStream();
    setAudioBlob(null);
    if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(null); }
    setRecordSeconds(0);
    setRecordingState("idle");
    setUploadError(null);
    setUploadSuccess(false);
  };

  const handleSubmitSpeech = async () => {
    if (!audioBlob || !session) return;
    const activeTopic = topics.length > 0 ? topics[0] : null;
    if (recordSeconds < 10) { setUploadError("Speech must be at least 10 seconds long."); return; }
    if (recordSeconds > 300) { setUploadError("Speech cannot exceed 5 minutes."); return; }
    if (audioBlob.size > 30 * 1024 * 1024) { setUploadError("Audio file exceeds the 30 MB size limit."); return; }
    setIsUploading(true); setUploadError(null); setUploadSuccess(false);
    try {
      const formData = new FormData();
      const fileExt = audioBlob.type.split(";")[0].split("/")[1] || "webm";
      formData.append("file", audioBlob, `speech_${Date.now()}.${fileExt}`);
      formData.append("topic_id", activeTopic?.id || "null");
      formData.append("duration_seconds", Math.round(recordSeconds).toString());
      const res = await fetch("http://localhost:8000/api/speeches/upload", {
        method: "POST", headers: { Authorization: `Bearer ${session.access_token}` }, body: formData,
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || `Server error: ${res.status}`); }
      const data = await res.json();
      setUploadSuccess(true);
      if (data?.id) startPollingSpeech(data.id);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload speech.");
    } finally {
      setIsUploading(false);
    }
  };

  const startPollingSpeech = (speechId: string) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    setPolledSpeechId(speechId); setPolledSpeechDetails(null);
    pollingIntervalRef.current = setInterval(async () => {
      if (!session) return;
      try {
        const res = await fetch(`http://localhost:8000/api/speeches/${speechId}`, { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        setPolledSpeechDetails(data);
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(pollingIntervalRef.current); pollingIntervalRef.current = null;
          fetchHistory(1); fetchStats();
        }
      } catch {}
    }, 3000);
  };

  const discardSpeechAndReset = () => {
    if (pollingIntervalRef.current) { clearInterval(pollingIntervalRef.current); pollingIntervalRef.current = null; }
    setPolledSpeechId(null); setPolledSpeechDetails(null); discardRecording();
  };

  const fetchHistory = async (page: number) => {
    if (!session) return;
    setHistoryLoading(true); setHistoryError(null);
    try {
      const res = await fetch(`http://localhost:8000/api/speeches?page=${page}&limit=10`, { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setHistoryList(data || []); setHistoryPage(page); setHasMoreHistory(data?.length === 10);
    } catch (err: any) {
      setHistoryError(err.message || "Failed to load speech history.");
    } finally { setHistoryLoading(false); }
  };

  const fetchStats = async () => {
    if (!session) return;
    try {
      const res = await fetch("http://localhost:8000/api/speeches/stats", { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      setStats(await res.json());
    } catch {}
  };

  useEffect(() => { if (!loading && !user) router.replace("/login"); }, [user, loading, router]);
  useEffect(() => { if (session) { fetchHistory(1); fetchStats(); } }, [session]);

  const handleLogout = async () => {
    if (!supabase) return;
    setLogoutLoading(true);
    try { await supabase.auth.signOut(); router.replace("/login"); }
    catch {} finally { setLogoutLoading(false); }
  };

  const handleGenerateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setTopicLoading(true); setTopicError(null);
    try {
      let url = `http://localhost:8000/api/topics/generate?category=${category}&difficulty=${difficulty}`;
      if (customTopic.trim()) url += `&custom_topic=${encodeURIComponent(customTopic.trim())}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || `Error: ${res.status}`); }
      const data = await res.json();
      if (data?.topics) setTopics(data.topics);
    } catch (err: any) {
      setTopicError(err.message || "Failed to generate topic.");
    } finally { setTopicLoading(false); }
  };

  // Chart renderer
  const renderProgressChart = () => {
    const chartSpeeches = [...historyList].filter(s => s.status === "completed" && s.overall_score !== null).reverse();
    if (chartSpeeches.length === 0) return (
      <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-meta)", fontSize: 13 }}>
        No completed speeches to chart yet.
      </div>
    );
    const W = 560, H = 120, PX = 24, PY = 16;
    const uW = W - PX * 2, uH = H - PY * 2;
    const pts = chartSpeeches.map((s, i) => ({
      x: PX + (chartSpeeches.length > 1 ? (i / (chartSpeeches.length - 1)) * uW : uW / 2),
      y: H - PY - ((s.overall_score || 0) / 100) * uH,
      score: s.overall_score,
      date: new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }));
    const pathD = pts.length > 1 ? `M ${pts[0].x} ${pts[0].y}` + pts.slice(1).map(p => ` L ${p.x} ${p.y}`).join("") : "";
    const fillD = pathD ? `${pathD} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z` : "";
    const stroke = cute ? "#f472b6" : "#4f46e5";
    return (
      <div style={{ marginTop: 8 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
          <defs>
            <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.15" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
            <line key={i} x1={PX} y1={PY + (1 - v) * uH} x2={W - PX} y2={PY + (1 - v) * uH} stroke="#f1f5f9" strokeWidth="1" />
          ))}
          {pts.length > 1 && <path d={fillD} fill="url(#cg)" />}
          {pts.length > 1 && <path d={pathD} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={i === pts.length - 1 ? 5 : 3.5} fill="#fff" stroke={stroke} strokeWidth="2" />
              {(i === 0 || i === pts.length - 1) && (
                <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fill={stroke} fontWeight="700">{p.score}</text>
              )}
              <text x={p.x} y={H - 2} textAnchor="middle" fontSize="8" fill="#94a3b8">{p.date}</text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
      <p style={{ color: "var(--text-sub)", fontSize: 13 }}>Verifying session…</p>
    </div>
  );
  if (!user) return null;

  const activeTopic = topics.length > 0 ? topics[0] : null;
  const cute = stats?.is_cute_mode ?? false;

  // Apply cute theme to html element
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", cute ? "cute" : "default");
  }

  const NAV_H = 56;
  const SIDEBAR_W = 220;

  const CATEGORIES = [
    { value: "impromptu", label: "Impromptu Speaking" },
    { value: "interview", label: "Job Interview" },
    { value: "persuasive", label: "Persuasive Argument" },
    { value: "warmup", label: "Icebreaker & Warmup" },
    { value: "debate", label: "Debate Practice" },
  ];
  const DIFFICULTIES = ["easy", "medium", "hard"];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", fontFamily: "Inter, sans-serif" }}>

      {/* ── TOP NAVBAR ──────────────────────────────────────────────────────── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 40, height: NAV_H, background: "var(--nav-bg)", borderBottom: "1px solid var(--nav-border)", display: "flex", alignItems: "center", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 32 }}>
          <div style={{ width: 28, height: 28, background: "var(--accent)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>S</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-main)" }}>SpeakAI Coach</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          {(["practice", "analytics", "history"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "6px 14px", fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? "var(--accent)" : "var(--text-sub)",
              borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
              background: "none", border: "none", borderBottomStyle: "solid",
              borderBottomWidth: 2, borderBottomColor: activeTab === tab ? "var(--accent)" : "transparent",
              cursor: "pointer", textTransform: "capitalize",
            }}>
              {tab === "practice" ? "Dashboard" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "var(--text-meta)" }}>{user.email}</span>
          <button onClick={handleLogout} disabled={logoutLoading} className="btn-secondary" style={{ fontSize: 12, padding: "6px 12px" }}>
            {logoutLoading ? "Logging out…" : "Log Out"}
          </button>
        </div>
      </nav>

      <div style={{ display: "flex", minHeight: `calc(100vh - ${NAV_H}px)` }}>

        {/* ── LEFT SIDEBAR ────────────────────────────────────────────────────── */}
        <aside style={{ width: SIDEBAR_W, flexShrink: 0, borderRight: "1px solid var(--border-color)", background: "var(--bg-card)", padding: "20px 0", display: "flex", flexDirection: "column", position: "sticky", top: NAV_H, height: `calc(100vh - ${NAV_H}px)`, overflowY: "auto" }}>
          <div style={{ padding: "0 16px", marginBottom: 4 }}>
            <div className="label-xs" style={{ marginBottom: 8 }}>NAVIGATION</div>
            {[
              { tab: "practice" as const, label: "Dashboard" },
              { tab: "analytics" as const, label: "Analytics" },
              { tab: "history" as const, label: "History" },
            ].map(({ tab, label }) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: 5, fontSize: 13,
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? "var(--accent)" : "var(--text-sub)",
                background: activeTab === tab ? "var(--accent-light)" : "transparent",
                borderLeft: activeTab === tab ? `3px solid var(--accent)` : "3px solid transparent",
                cursor: "pointer", border: "none", marginBottom: 2, display: "block",
              }}>
                {label}
              </button>
            ))}
          </div>

          <hr className="divider" style={{ margin: "16px 0" }} />

          <div style={{ padding: "0 16px", flex: 1 }}>
            <div className="label-xs" style={{ marginBottom: 8 }}>RECENT SESSIONS</div>
            {historyList.slice(0, 5).map(item => (
              <button key={item.id} onClick={() => { setUploadSuccess(true); setPolledSpeechId(item.id); setPolledSpeechDetails(item); setActiveTab("practice"); }}
                style={{
                  width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 5,
                  background: polledSpeechId === item.id ? "var(--accent-light)" : "transparent",
                  borderLeft: polledSpeechId === item.id ? "3px solid var(--accent)" : "3px solid transparent",
                  cursor: "pointer", border: "none", marginBottom: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
                }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.topics?.title || "Impromptu Speech"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-meta)" }}>
                    {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </div>
                </div>
                {item.overall_score !== null && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 9999, background: "#f1f5f9", color: "#475569", flexShrink: 0 }}>
                    {item.overall_score}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
        <main style={{ flex: 1, padding: 32, maxWidth: 1100, overflowY: "auto" }}>

          {/* ════════════════════════════════════ PRACTICE TAB ══ */}
          {activeTab === "practice" && (
            <div>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-main)", letterSpacing: "-0.01em", marginBottom: 4 }}>Dashboard</h1>
                <p style={{ fontSize: 13, color: "var(--text-sub)" }}>Practice speeches, analyze transcripts, and track your metrics.</p>
              </div>

              {/* ── TOPIC GENERATOR CARD ── */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div className="label-xs" style={{ marginBottom: 4 }}>STEP 1</div>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-main)" }}>AI Topic Generator</h2>
                    <p style={{ fontSize: 12, color: "var(--text-sub)", marginTop: 2 }}>Generate a custom speaking prompt tailored to your goals.</p>
                  </div>
                </div>

                <form onSubmit={handleGenerateTopic}>
                  <div style={{ marginBottom: 14 }}>
                    <div className="label-xs" style={{ marginBottom: 6 }}>CATEGORY</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {CATEGORIES.map(c => (
                        <button key={c.value} type="button" onClick={() => setCategory(c.value)} style={{
                          padding: "6px 12px", fontSize: 12, fontWeight: 500, borderRadius: 4, cursor: "pointer",
                          background: category === c.value ? "var(--accent)" : "var(--bg-primary)",
                          color: category === c.value ? "#fff" : "var(--text-sub)",
                          border: `1px solid ${category === c.value ? "var(--accent)" : "var(--border-color)"}`,
                          transition: "all 0.15s ease",
                        }}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "end" }}>
                    <div>
                      <div className="label-xs" style={{ marginBottom: 6 }}>DIFFICULTY</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {DIFFICULTIES.map(d => (
                          <button key={d} type="button" onClick={() => setDifficulty(d)} style={{
                            padding: "6px 14px", fontSize: 12, fontWeight: 500, borderRadius: 4, cursor: "pointer",
                            background: difficulty === d ? "var(--accent)" : "var(--bg-primary)",
                            color: difficulty === d ? "#fff" : "var(--text-sub)",
                            border: `1px solid ${difficulty === d ? "var(--accent)" : "var(--border-color)"}`,
                            textTransform: "capitalize",
                          }}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="label-xs" style={{ marginBottom: 6 }}>CUSTOM TOPIC (OPTIONAL)</div>
                      <input className="input" value={customTopic} onChange={e => setCustomTopic(e.target.value)}
                        placeholder="e.g. benefits of remote work…" />
                    </div>

                    <button type="submit" disabled={topicLoading} className="btn-primary">
                      {topicLoading ? "Generating…" : "Generate Prompt"}
                    </button>
                  </div>
                </form>

                {topicError && (
                  <div style={{ marginTop: 12, padding: "8px 12px", background: "var(--danger-light)", border: "1px solid #fca5a5", borderRadius: 5, fontSize: 12, color: "var(--danger)" }}>
                    {topicError}
                  </div>
                )}

                {/* Generated Topic */}
                {activeTopic && (
                  <div style={{ marginTop: 16, padding: 16, background: "var(--accent-light)", borderLeft: "3px solid var(--accent)", borderRadius: 5 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div className="label-xs" style={{ color: "var(--accent-text)", marginBottom: 4 }}>ACTIVE TOPIC</div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-main)", marginBottom: 8 }}>{activeTopic.title}</div>
                        <div className="label-xs" style={{ marginBottom: 4 }}>PROMPT</div>
                        <p style={{ fontSize: 13, color: "var(--text-sub)", lineHeight: 1.6, marginBottom: activeTopic.context ? 10 : 0 }}>{activeTopic.prompt}</p>
                        {activeTopic.context && (
                          <>
                            <div className="label-xs" style={{ marginBottom: 4 }}>CONTEXT</div>
                            <p style={{ fontSize: 12, color: "var(--text-sub)", lineHeight: 1.6, marginBottom: 10 }}>{activeTopic.context}</p>
                          </>
                        )}
                        {activeTopic.suggested_points?.length > 0 && (
                          <>
                            <div className="label-xs" style={{ marginBottom: 4 }}>TALKING POINTS</div>
                            <ul style={{ fontSize: 12, color: "var(--text-sub)", paddingLeft: 16, lineHeight: 1.8 }}>
                              {activeTopic.suggested_points.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                          </>
                        )}
                      </div>
                      <span className="badge badge-indigo" style={{ flexShrink: 0, textTransform: "capitalize" }}>{difficulty}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── PRACTICE TERMINAL CARD ── */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ marginBottom: 16 }}>
                  <div className="label-xs" style={{ marginBottom: 4 }}>STEP 2</div>
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-main)" }}>Practice Terminal</h2>
                  <p style={{ fontSize: 12, color: "var(--text-sub)", marginTop: 2 }}>Record your speech and receive AI coaching feedback.</p>
                </div>

                {/* If viewing existing result */}
                {uploadSuccess ? (
                  <div>
                    {/* Processing */}
                    {(!polledSpeechDetails || !["completed", "failed"].includes(polledSpeechDetails.status)) && (
                      <div style={{ padding: 24, textAlign: "center", background: "var(--bg-primary)", borderRadius: 6, border: "1px solid var(--border-color)" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 12 }}>
                          {[0, 1, 2].map(i => (
                            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
                          ))}
                        </div>
                        <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-main)", marginBottom: 4 }}>
                          {polledSpeechDetails ? `Status: ${polledSpeechDetails.status}` : "Initializing analysis…"}
                        </p>
                        <p style={{ fontSize: 12, color: "var(--text-sub)" }}>
                          {polledSpeechDetails?.status === "transcribing" && "Transcribing your audio to text…"}
                          {polledSpeechDetails?.status === "analyzing" && "AI is evaluating your delivery and structure…"}
                          {!polledSpeechDetails && "Connecting to processing pipeline…"}
                        </p>
                      </div>
                    )}

                    {/* Failed */}
                    {polledSpeechDetails?.status === "failed" && (
                      <div style={{ padding: 16, background: "var(--danger-light)", border: "1px solid #fca5a5", borderRadius: 6 }}>
                        <p style={{ fontWeight: 600, fontSize: 13, color: "var(--danger)", marginBottom: 8 }}>Speech Analysis Failed</p>
                        <p style={{ fontSize: 12, color: "var(--danger)", marginBottom: 12 }}>We encountered an issue during transcription or analysis. This can be caused by excessive background noise or poor audio quality.</p>
                        <button onClick={discardSpeechAndReset} className="btn-danger" style={{ fontSize: 12 }}>Discard & Try Again</button>
                      </div>
                    )}

                    {/* Completed — Evaluation Dashboard */}
                    {polledSpeechDetails?.status === "completed" && (
                      <div style={{ animation: "fadeIn 0.4s ease forwards" }}>
                        {/* Topic header */}
                        <div style={{ padding: "12px 16px", background: "var(--accent-light)", borderLeft: "3px solid var(--accent)", borderRadius: 5, marginBottom: 16 }}>
                          <div className="label-xs" style={{ color: "var(--accent-text)", marginBottom: 2 }}>EVALUATED TOPIC</div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-main)" }}>
                            {polledSpeechDetails.topics?.title || "Impromptu Speech"}
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          {/* Left column */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {/* Score card */}
                            <div className="card card-accent">
                              <div className="label-xs" style={{ marginBottom: 12 }}>OVERALL SCORE</div>
                              <ScoreDial score={polledSpeechDetails.overall_score} cute={cute} />
                            </div>

                            {/* Skill breakdown */}
                            <div className="card">
                              <div className="label-xs" style={{ marginBottom: 12 }}>SKILL BREAKDOWN</div>
                              <SkillBar label="Pronunciation" score={polledSpeechDetails.pronunciation_score} cute={cute} />
                              <SkillBar label="Fluency & Pacing" score={polledSpeechDetails.fluency_score} cute={cute} />
                              <SkillBar label="Grammar" score={polledSpeechDetails.grammar_score} cute={cute} />
                              <SkillBar label="Content & Argument" score={polledSpeechDetails.content_score} cute={cute} />
                              {polledSpeechDetails.lexicon_score !== null && (
                                <SkillBar label="Lexicon" score={polledSpeechDetails.lexicon_score} cute={cute} />
                              )}
                            </div>

                            {/* Transcript */}
                            {polledSpeechDetails.transcript && (
                              <div className="card">
                                <div className="label-xs" style={{ marginBottom: 8 }}>SPOKEN TRANSCRIPT</div>
                                <p style={{ fontSize: 12, color: "var(--text-sub)", lineHeight: 1.7, maxHeight: 160, overflowY: "auto" }}>
                                  {polledSpeechDetails.transcript}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Right column */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {/* Written feedback */}
                            {polledSpeechDetails.feedback?.written_feedback && (
                              <div className="card">
                                <div className="label-xs" style={{ marginBottom: 8 }}>COACH FEEDBACK</div>
                                <p style={{ fontSize: 12, color: "var(--text-sub)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                                  {renderMarkdown(polledSpeechDetails.feedback.written_feedback)}
                                </p>
                              </div>
                            )}

                            {/* Vocabulary upgrades */}
                            {polledSpeechDetails.feedback?.lexicon_suggestions && polledSpeechDetails.feedback.lexicon_suggestions.length > 0 && (
                              <div className="card">
                                <div className="label-xs" style={{ marginBottom: 8 }}>VOCABULARY UPGRADES</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                  {polledSpeechDetails.feedback.lexicon_suggestions.map((s, i) => (
                                    <div key={i} style={{ padding: "8px 10px", background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 5, display: "flex", alignItems: "center", gap: 6, fontSize: 12, flexWrap: "wrap" }}>
                                      <span style={{ textDecoration: "line-through", color: "var(--danger)" }}>{s.original_word}</span>
                                      <span style={{ color: "var(--text-meta)" }}>→</span>
                                      <span style={{ fontWeight: 600, color: "var(--success)" }}>{s.suggested_replacement}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Debate counter-argument */}
                            {polledSpeechDetails.feedback?.counter_argument && (
                              <div className="card card-warning">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                  <div className="label-xs" style={{ color: "#92400e" }}>AI COUNTER-ARGUMENT</div>
                                  <span className="badge badge-amber">Debate Mode</span>
                                </div>
                                <p style={{ fontSize: 12, color: "#78350f", lineHeight: 1.7, marginBottom: 12 }}>
                                  {polledSpeechDetails.feedback.counter_argument}
                                </p>
                                {polledSpeechDetails.feedback.challenge_questions?.length ? (
                                  <>
                                    <div className="label-xs" style={{ color: "#92400e", marginBottom: 6 }}>CHALLENGE QUESTIONS</div>
                                    <ol style={{ paddingLeft: 16, fontSize: 12, color: "#78350f", lineHeight: 1.8 }}>
                                      {polledSpeechDetails.feedback.challenge_questions.map((q, i) => <li key={i}>{q}</li>)}
                                    </ol>
                                  </>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                          <button onClick={discardSpeechAndReset} className="btn-primary">Practice Another Topic</button>
                          <button onClick={() => setActiveTab("history")} className="btn-secondary">View in History</button>
                        </div>

                        <p style={{ marginTop: 10, fontSize: 11, color: "var(--text-meta)", textAlign: "center" }}>
                          Your voice recording was permanently deleted from storage after processing.
                        </p>
                      </div>
                    )}
                  </div>
                ) : !activeTopic ? (
                  <div style={{ padding: 32, textAlign: "center", color: "var(--text-meta)" }}>
                    <p style={{ fontSize: 13 }}>Generate a speaking prompt above to unlock the Practice Terminal.</p>
                  </div>
                ) : (
                  <div>
                    {/* Active topic banner */}
                    <div style={{ padding: "10px 14px", background: "var(--accent-light)", borderLeft: "3px solid var(--accent)", borderRadius: 5, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div className="label-xs" style={{ color: "var(--accent-text)", marginBottom: 2 }}>ACTIVE TOPIC</div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-main)" }}>{activeTopic.title}</div>
                      </div>
                      <button onClick={() => setTopics([])} style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>Change Topic</button>
                    </div>

                    {/* Timer */}
                    <div style={{ textAlign: "center", marginBottom: 20 }}>
                      <div style={{ fontSize: 52, fontWeight: 700, fontFamily: "monospace", color: "var(--text-main)", letterSpacing: "-0.02em" }}>
                        {formatTime(recordSeconds)}
                      </div>
                      {recordingState === "recording" && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#dc2626", animation: "pulse 1s ease-in-out infinite" }} />
                          <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 500 }}>Recording in progress</span>
                        </div>
                      )}
                      {recordingState === "paused" && (
                        <div style={{ fontSize: 12, color: "#d97706", fontWeight: 500, marginTop: 4 }}>Paused</div>
                      )}
                      {recordingState === "idle" && (
                        <div style={{ fontSize: 12, color: "var(--text-meta)", marginTop: 4 }}>Min: 10s · Max: 5 min · Max size: 30 MB</div>
                      )}
                    </div>

                    {/* Waveform */}
                    <div style={{ marginBottom: 20 }}>
                      <Waveform active={recordingState === "recording"} cute={cute} />
                      <p style={{ fontSize: 11, color: "var(--text-meta)", textAlign: "center", marginTop: 6 }}>Live microphone input</p>
                    </div>

                    {/* Controls */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
                      {recordingState === "idle" && (
                        <button onClick={startRecording} className="btn-primary" style={{ padding: "10px 24px" }}>Start Recording</button>
                      )}
                      {recordingState === "recording" && (
                        <>
                          <button onClick={pauseRecording} className="btn-secondary">Pause</button>
                          <button onClick={() => stopRecordingAndStream()} style={{ padding: "9px 16px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 5, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Stop & Preview</button>
                        </>
                      )}
                      {recordingState === "paused" && (
                        <>
                          <button onClick={resumeRecording} className="btn-primary">Resume</button>
                          <button onClick={() => stopRecordingAndStream()} className="btn-secondary">Stop & Preview</button>
                        </>
                      )}
                    </div>

                    {/* Stopped — preview & submit */}
                    {recordingState === "stopped" && (
                      <div style={{ borderTop: "1px solid var(--divider)", paddingTop: 16 }}>
                        <div style={{ marginBottom: 12 }}>
                          <div className="label-xs" style={{ marginBottom: 6 }}>RECORDING PREVIEW</div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-sub)", marginBottom: 6 }}>
                            <span>Duration: {formatTime(recordSeconds)}</span>
                            {audioBlob && <span>Size: {(audioBlob.size / (1024 * 1024)).toFixed(2)} MB</span>}
                          </div>
                          {audioUrl && <audio src={audioUrl} controls style={{ width: "100%", height: 40 }} />}
                        </div>

                        {recordSeconds < 10 && (
                          <div style={{ padding: "8px 12px", background: "var(--danger-light)", border: "1px solid #fca5a5", borderRadius: 5, fontSize: 12, color: "var(--danger)", marginBottom: 12 }}>
                            Recording must be at least 10 seconds. Please discard and try again.
                          </div>
                        )}

                        <div style={{ display: "flex", gap: 10 }}>
                          <button onClick={handleSubmitSpeech} disabled={isUploading || recordSeconds < 10} className="btn-primary" style={{ flex: 1 }}>
                            {isUploading ? "Uploading…" : "Submit for AI Review →"}
                          </button>
                          <button onClick={discardRecording} disabled={isUploading} className="btn-danger">Discard</button>
                        </div>
                        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-meta)", marginTop: 8 }}>Results typically ready in 30–60 seconds.</p>
                      </div>
                    )}

                    {uploadError && (
                      <div style={{ marginTop: 10, padding: "8px 12px", background: "var(--danger-light)", border: "1px solid #fca5a5", borderRadius: 5, fontSize: 12, color: "var(--danger)" }}>
                        {uploadError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════ ANALYTICS TAB ══ */}
          {activeTab === "analytics" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-main)", letterSpacing: "-0.01em", marginBottom: 4 }}>Analytics</h1>
                  <p style={{ fontSize: 13, color: "var(--text-sub)" }}>Track your progress, consistency, and improvement over time.</p>
                </div>
              </div>

              {!stats || stats.completed_speeches === 0 ? (
                <div className="card" style={{ padding: 40, textAlign: "center" }}>
                  <p style={{ color: "var(--text-meta)", fontSize: 13 }}>Complete your first speech to unlock Analytics.</p>
                </div>
              ) : (
                <>
                  {/* 5-metric grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
                    <StatCard label="AVERAGE RATING" value={`${stats.average_overall_score}`} sub={`/ 100`} cute={cute} />
                    <StatCard label="BEST SCORE" value={`${stats.best_overall_score}`} sub="Personal best" cute={cute} />
                    <StatCard label="LATEST SCORE" value={`${stats.latest_overall_score}`} cute={cute} />
                    <StatCard label="CURRENT STREAK" value={`${stats.current_streak} days`} sub={stats.current_streak > 0 ? "Keep it up!" : "Start today"} cute={cute} />
                    <StatCard label="LONGEST STREAK" value={`${stats.longest_streak} days`} sub="Record" cute={cute} />
                  </div>

                  {/* Score chart */}
                  <div className="card" style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-main)" }}>Score Progression</h2>
                      <span style={{ fontSize: 12, color: "var(--text-meta)" }}>{historyList.filter(s => s.status === "completed").length} attempts tracked</span>
                    </div>
                    {stats.percent_improvement !== 0 && (
                      <p style={{ fontSize: 12, color: "var(--success)", marginBottom: 8 }}>
                        {stats.percent_improvement > 0 ? "▲" : "▼"} {Math.abs(stats.percent_improvement)}% improvement overall
                        · {stats.score_delta_first > 0 ? "+" : ""}{stats.score_delta_first} pts since first session
                      </p>
                    )}
                    {renderProgressChart()}
                  </div>

                  {/* Bottom row */}
                  <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
                    {stats.average_lexicon_score !== undefined && stats.average_lexicon_score > 0 && (
                      <div className="card">
                        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-main)", marginBottom: 12 }}>Lexicon Performance</h2>
                        {[
                          { label: "Average Lexicon", value: stats.average_lexicon_score, color: "#4f46e5" },
                          { label: "Best Lexicon", value: stats.best_lexicon_score ?? 0, color: "#059669" },
                          { label: "Latest Lexicon", value: stats.latest_lexicon_score ?? 0, color: "#d97706" },
                        ].map(({ label, value, color }) => (
                          <div key={label} style={{ marginBottom: 10 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                              <span style={{ color: "var(--text-sub)" }}>{label}</span>
                              <span style={{ fontWeight: 600, color }}>{value} / 100</span>
                            </div>
                            <div className="progress-track">
                              <div className="progress-fill" style={{ width: `${value}%`, background: color }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="card">
                      <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-main)", marginBottom: 12 }}>Practice Summary</h2>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                          { label: "Total Sessions", value: stats.total_speeches },
                          { label: "Completed", value: stats.completed_speeches },
                          { label: "Current Streak", value: `${stats.current_streak} days` },
                          { label: "Longest Streak", value: `${stats.longest_streak} days` },
                        ].map(({ label, value }) => (
                          <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                            <span style={{ color: "var(--text-sub)" }}>{label}</span>
                            <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ════════════════════════════════════ HISTORY TAB ══ */}
          {activeTab === "history" && (
            <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
              {/* Session list panel */}
              <div className="card" style={{ padding: 0, alignSelf: "start", position: "sticky", top: NAV_H + 20 }}>
                <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--divider)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)" }}>Practice History</h2>
                  <span style={{ fontSize: 12, color: "var(--text-meta)" }}>{historyList.length} sessions</span>
                </div>

                {historyError && (
                  <div style={{ padding: "8px 16px", fontSize: 12, color: "var(--danger)", background: "var(--danger-light)" }}>{historyError}</div>
                )}

                {!historyLoading && historyList.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: "var(--text-meta)", fontSize: 13 }}>No sessions recorded yet.</div>
                ) : (
                  <div>
                    {historyList.map(item => (
                      <button key={item.id} onClick={() => { setPolledSpeechId(item.id); setPolledSpeechDetails(item); setUploadSuccess(true); }}
                        style={{
                          width: "100%", textAlign: "left", padding: "12px 16px",
                          borderBottom: "1px solid var(--divider)",
                          background: polledSpeechId === item.id ? "var(--accent-light)" : "var(--bg-card)",
                          borderLeft: polledSpeechId === item.id ? `3px solid var(--accent)` : "3px solid transparent",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                          border: "none",
                        }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: polledSpeechId === item.id ? 600 : 400, color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
                            {item.topics?.title || "Impromptu Speech"}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-meta)" }}>
                            {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} · {item.duration_seconds}s
                          </div>
                        </div>
                        {item.overall_score !== null ? (
                          <span className={scoreBadgeClass(item.overall_score)} style={{ flexShrink: 0 }}>{item.overall_score}</span>
                        ) : (
                          <span className="badge badge-slate" style={{ flexShrink: 0, textTransform: "capitalize" }}>{item.status}</span>
                        )}
                      </button>
                    ))}

                    <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <button onClick={() => fetchHistory(historyPage - 1)} disabled={historyPage === 1 || historyLoading} className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>← Previous</button>
                      <span style={{ fontSize: 12, color: "var(--text-meta)" }}>Page {historyPage}</span>
                      <button onClick={() => fetchHistory(historyPage + 1)} disabled={!hasMoreHistory || historyLoading} className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>Next →</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Detail panel */}
              <div>
                {!polledSpeechDetails ? (
                  <div className="card" style={{ padding: 40, textAlign: "center" }}>
                    <p style={{ color: "var(--text-meta)", fontSize: 13 }}>Select a session from the list to view its full evaluation.</p>
                  </div>
                ) : polledSpeechDetails.status !== "completed" ? (
                  <div className="card" style={{ padding: 24, textAlign: "center" }}>
                    <span className={`badge ${scoreBadgeClass(null)}`} style={{ textTransform: "capitalize", marginBottom: 8 }}>{polledSpeechDetails.status}</span>
                    <p style={{ color: "var(--text-meta)", fontSize: 13 }}>This session has not completed processing yet.</p>
                  </div>
                ) : (
                  <div style={{ animation: "fadeIn 0.3s ease" }}>
                    {/* Breadcrumb */}
                    <p style={{ fontSize: 12, color: "var(--text-meta)", marginBottom: 8 }}>History › {polledSpeechDetails.topics?.title || "Impromptu Speech"}</p>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-main)", marginBottom: 4, letterSpacing: "-0.01em" }}>
                      {polledSpeechDetails.topics?.title || "Impromptu Speech"}
                    </h1>
                    <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                      <span className="badge badge-slate">{new Date(polledSpeechDetails.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
                      <span className="badge badge-slate">{polledSpeechDetails.duration_seconds}s</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div className="card card-accent">
                          <div className="label-xs" style={{ marginBottom: 12 }}>OVERALL SCORE</div>
                          <ScoreDial score={polledSpeechDetails.overall_score} cute={cute} />
                        </div>
                        <div className="card">
                          <div className="label-xs" style={{ marginBottom: 12 }}>SKILL BREAKDOWN</div>
                          <SkillBar label="Pronunciation" score={polledSpeechDetails.pronunciation_score} cute={cute} />
                          <SkillBar label="Fluency & Pacing" score={polledSpeechDetails.fluency_score} cute={cute} />
                          <SkillBar label="Grammar" score={polledSpeechDetails.grammar_score} cute={cute} />
                          <SkillBar label="Content & Argument" score={polledSpeechDetails.content_score} cute={cute} />
                          {polledSpeechDetails.lexicon_score !== null && <SkillBar label="Lexicon" score={polledSpeechDetails.lexicon_score} cute={cute} />}
                        </div>
                        {polledSpeechDetails.transcript && (
                          <div className="card">
                            <div className="label-xs" style={{ marginBottom: 8 }}>SPOKEN TRANSCRIPT</div>
                            <p style={{ fontSize: 12, color: "var(--text-sub)", lineHeight: 1.7, maxHeight: 160, overflowY: "auto" }}>{polledSpeechDetails.transcript}</p>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {polledSpeechDetails.feedback?.written_feedback && (
                          <div className="card">
                            <div className="label-xs" style={{ marginBottom: 8 }}>COACH FEEDBACK</div>
                            <p style={{ fontSize: 12, color: "var(--text-sub)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{renderMarkdown(polledSpeechDetails.feedback.written_feedback)}</p>
                          </div>
                        )}
                        {polledSpeechDetails.feedback?.lexicon_suggestions && polledSpeechDetails.feedback.lexicon_suggestions.length > 0 && (
                          <div className="card">
                            <div className="label-xs" style={{ marginBottom: 8 }}>VOCABULARY UPGRADES</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                              {polledSpeechDetails.feedback.lexicon_suggestions.map((s, i) => (
                                <div key={i} style={{ padding: "8px 10px", background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 5, display: "flex", alignItems: "center", gap: 6, fontSize: 12, flexWrap: "wrap" }}>
                                  <span style={{ textDecoration: "line-through", color: "var(--danger)" }}>{s.original_word}</span>
                                  <span style={{ color: "var(--text-meta)" }}>→</span>
                                  <span style={{ fontWeight: 600, color: "var(--success)" }}>{s.suggested_replacement}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {polledSpeechDetails.feedback?.counter_argument && (
                          <div className="card card-warning">
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                              <div className="label-xs" style={{ color: "#92400e" }}>AI COUNTER-ARGUMENT</div>
                              <span className="badge badge-amber">Debate Mode</span>
                            </div>
                            <p style={{ fontSize: 12, color: "#78350f", lineHeight: 1.7 }}>{polledSpeechDetails.feedback.counter_argument}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <button onClick={() => { discardSpeechAndReset(); setActiveTab("practice"); }} className="btn-primary">Practice This Topic Again</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
