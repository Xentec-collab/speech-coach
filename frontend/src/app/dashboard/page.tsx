"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AdBanner } from "@/components/AdBanner";
import { getApiBaseUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Sun, Moon, BarChart2, Menu, X, History, Mic, Layers, BookOpen, Bot } from "lucide-react";

// ── Interfaces ────────────────────────────────────────────────────────────────
interface GeneratedTopic {
  id?: string;
  title: string;
  prompt: string;
  context: string;
  suggested_points: string[];
  module_type?: string;
  interview_type?: string;
  interview_persona?: string;
}
interface LexiconSuggestion {
  original_word: string; suggested_replacement: string; explanation: string;
}
interface SpeechFeedback {
  written_feedback: string;
  lexicon_suggestions?: LexiconSuggestion[];
  counter_argument?: string;
  challenge_questions?: string[];
  interview_metrics?: {
    confidence: number;
    professionalism: number;
    readiness: number;
    structure: number;
    relevance: number;
  } | null;
  follow_up_question?: string | null;
}
interface SpeechHistoryItem {
  id: string; user_id: string; topic_id: string | null; storage_path: string; original_filename: string;
  mime_type: string; duration_seconds: number;
  status: "uploaded"|"transcribing"|"analyzing"|"completed"|"failed";
  transcript: string | null; feedback: SpeechFeedback | null; overall_score: number | null;
  pronunciation_score: number | null; fluency_score: number | null; grammar_score: number | null;
  content_score: number | null; lexicon_score: number | null; retry_count: number;
  created_at: string; topics?: GeneratedTopic | null;
  is_session?: boolean;
}
interface SpeechStatistics {
  total_speeches: number; completed_speeches: number; average_overall_score: number;
  best_overall_score: number; latest_overall_score: number; average_lexicon_score?: number;
  best_lexicon_score?: number; latest_lexicon_score?: number; score_delta_first: number;
  score_delta_prev: number; percent_improvement: number; current_streak: number;
  longest_streak: number; is_cute_mode?: boolean;
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Ic = {
  Search: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Mic: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  Clock: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Cal: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Chevron: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  X: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Bell: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Settings: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  LogOut: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Sparkle: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707m0-12.728.707.707m11.314 11.314.707.707M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const ft = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const fd = (s: number) => {
  if (!s || s <= 0) return "0s";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = Math.floor(s % 60);
  if (h > 0) return m === 0 ? `${h}h` : `${h}h ${m}m`;
  return m === 0 ? `${r}s` : r === 0 ? `${m}m` : `${m}m ${r}s`;
};
const fShort = (d: string) => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"});
const fLong  = (d: string) => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const fTime  = (d: string) => new Date(d).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true});
const scoreLabel = (s: number) => s>=85?"Excellent":s>=70?"Good":s>=55?"Developing":"Needs Work";

const FILLERS = ["like","um","uh","you know","kind of","sort of","basically","literally","actually","yeah","right","I mean"];

const INTERVIEW_TYPES = [
  { value: "cat_gdpi", label: "CAT GDPI" },
  { value: "mba_admissions", label: "MBA Admissions" },
  { value: "university_admissions", label: "University Admissions" },
  { value: "scholarship_interview", label: "Scholarship Interview" },
  { value: "campus_placement", label: "Campus Placement" },
  { value: "hr_interview", label: "HR Interview" },
  { value: "software_engineering", label: "Software Engineering Interview" },
  { value: "software_engineering_interview", label: "Software Engineering Interview" },
  { value: "banking_interview", label: "Banking Interview" },
  { value: "upsc_interview", label: "UPSC Interview" },
  { value: "ssc_interview", label: "SSC Interview" },
];

const INTERVIEW_PERSONAS = [
  { value: "friendly", label: "Friendly" },
  { value: "strict", label: "Strict" },
  { value: "corporate", label: "Corporate" },
  { value: "government_panel", label: "Government Panel" },
  { value: "ivy_league", label: "Ivy League" },
  { value: "mba_panel", label: "MBA Panel" },
];

const formatCleanTitle = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .replace(/_/g, " ")
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const formatInterviewType = (typeStr: string | null | undefined): string => {
  if (!typeStr) return "Interview";
  const str = typeStr.trim();
  const foundExact = INTERVIEW_TYPES.find(t => t.value.toLowerCase() === str.toLowerCase());
  if (foundExact) return foundExact.label;

  const foundAppended = INTERVIEW_TYPES.find(t => t.value.toLowerCase() === `${str}_interview`.toLowerCase());
  if (foundAppended) return foundAppended.label;

  const stripped = str.replace(/_interview$/i, "");
  const foundStripped = INTERVIEW_TYPES.find(t => t.value.replace(/_interview$/i, "").toLowerCase() === stripped.toLowerCase());
  if (foundStripped) return foundStripped.label;

  return str
    .replace(/_/g, " ")
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

const getDifficultyBadge = (difficulty: string | null | undefined) => {
  const diff = (difficulty || "medium").toLowerCase();
  if (diff === "easy") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-xs select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
        Easy
      </span>
    );
  } else if (diff === "hard" || diff === "advanced") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 shadow-xs select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
        Hard
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 shadow-xs select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        Medium
      </span>
    );
  }
};

const highlightTranscript = (text: string | null | undefined): React.ReactNode => {
  if (!text) return null;
  const pattern = `(\\[suggest break\\]|\\[do not break\\]|\\b(?:${FILLERS.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b)`;
  const regex = new RegExp(pattern, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((p, i) => {
        if (i % 2 === 1) {
          const lower = p.toLowerCase();
          if (lower === "[suggest break]") {
            return (
              <span 
                key={i} 
                title="Suggested pause" 
                className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-500 mx-1 align-middle select-none shrink-0" 
              />
            );
          } else if (lower === "[do not break]") {
            return (
              <span 
                key={i} 
                title="Avoid pause" 
                className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-amber-500 mx-1 align-middle select-none shrink-0" 
              />
            );
          } else {
            return (
              <span 
                key={i} 
                className="inline-block bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded px-1.5 py-0.5 mx-0.5 text-[11px] font-semibold align-baseline"
              >
                {p}
              </span>
            );
          }
        }
        return p;
      })}
    </>
  );
};

const parseCoachFeedback = (text: string) => {
  if (!text) return [];
  return text.split(/\n\n+/).filter(c => c.trim()).slice(0, 4).map(chunk => {
    const lines = chunk.trim().split("\n");
    const titleMatch = lines[0].match(/\*\*(.+?)\*\*/);
    let title = "";
    let body = "";

    if (titleMatch) {
      title = titleMatch[1];
      body = lines.slice(1).join(" ").trim().replace(/\*\*/g, "") || chunk.replace(/\*\*/g, "").replace(titleMatch[0], "").trim();
    } else if (lines.length > 1) {
      title = lines[0].replace(/\*\*/g, "").replace(/^[-•]\s*/, "");
      body = lines.slice(1).join(" ").trim().replace(/\*\*/g, "");
    } else {
      const cleanChunk = chunk.replace(/\*\*/g, "").replace(/^[-•]\s*/, "");
      const firstDot = cleanChunk.indexOf(". ");
      if (firstDot > 10 && firstDot < 80) {
        title = cleanChunk.slice(0, firstDot + 1);
        body = cleanChunk.slice(firstDot + 2).trim();
      } else {
        title = "Coach Recommendation";
        body = cleanChunk;
      }
    }

    if (title.trim() === body.trim()) {
      title = "Coach Feedback";
    }

    const lc = (title + " " + body).toLowerCase();
    const type = ["excellent", "strong", "great", "well done", "good job", "articulation", "clear"].some(w => lc.includes(w))
      ? "positive"
      : ["filler", "avoid", "issue", "weak", "problem", "improve", "need"].some(w => lc.includes(w))
      ? "warning"
      : "tip";

    return { title, body, type };
  });
};

const RadarChart = ({ scores }: { scores: number[] }) => {
  const cx = 110;
  const cy = 100;
  const R = 65;
  
  const angles = [
    -Math.PI / 2,
    -Math.PI / 2 + (2 * Math.PI) / 5,
    -Math.PI / 2 + (4 * Math.PI) / 5,
    -Math.PI / 2 + (6 * Math.PI) / 5,
    -Math.PI / 2 + (8 * Math.PI) / 5
  ];

  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const dataPoints = scores.map((score, i) => {
    const val = Math.max(10, Math.min(100, score || 50));
    const r = R * (val / 100);
    const x = cx + r * Math.cos(angles[i]);
    const y = cy + r * Math.sin(angles[i]);
    return `${x},${y}`;
  }).join(" ");

  const labels = [
    { text: "Clarity", x: cx, y: cy - R - 10, anchor: "middle" },
    { text: "Pacing", x: cx + R * Math.cos(angles[1]) + 10, y: cy + R * Math.sin(angles[1]) + 4, anchor: "start" },
    { text: "Grammar", x: cx + R * Math.cos(angles[2]) + 8, y: cy + R * Math.sin(angles[2]) + 10, anchor: "start" },
    { text: "Structure", x: cx + R * Math.cos(angles[3]) - 8, y: cy + R * Math.sin(angles[3]) + 10, anchor: "end" },
    { text: "Lexicon", x: cx + R * Math.cos(angles[4]) - 10, y: cy + R * Math.sin(angles[4]) + 4, anchor: "end" }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-muted/20 dark:bg-muted/5 rounded-xl border border-border/40 backdrop-blur-sm animate-bloom mt-2 w-full">
      <svg viewBox="0 0 220 200" className="w-full max-w-[210px] h-[190px]">
        <defs>
          <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.05" />
            <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0.25" />
          </radialGradient>
        </defs>
        
        {levels.map((lvl, idx) => {
          const pts = angles.map(angle => {
            const r = R * lvl;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            return `${x},${y}`;
          }).join(" ");
          return (
            <polygon 
              key={idx} 
              points={pts} 
              className="fill-none stroke-foreground/10 dark:stroke-foreground/5" 
              strokeWidth="1" 
              strokeDasharray={idx < 4 ? "2 2" : "none"}
            />
          );
        })}

        {angles.map((angle, idx) => {
          const x = cx + R * Math.cos(angle);
          const y = cy + R * Math.sin(angle);
          return (
            <line 
              key={idx} 
              x1={cx} 
              y1={cy} 
              x2={x} 
              y2={y} 
              className="stroke-foreground/10 dark:stroke-foreground/5" 
              strokeWidth="1" 
            />
          );
        })}

        <polygon 
          points={dataPoints} 
          fill="url(#radarGrad)" 
          className="stroke-[var(--accent-color)]" 
          strokeWidth="2" 
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {scores.map((score, i) => {
          const val = Math.max(10, Math.min(100, score || 50));
          const r = R * (val / 100);
          const x = cx + r * Math.cos(angles[i]);
          const y = cy + r * Math.sin(angles[i]);
          return (
            <circle 
              key={i} 
              cx={x} 
              cy={y} 
              r="3.5" 
              className="fill-background stroke-[var(--accent-color)]" 
              strokeWidth="2" 
            />
          );
        })}

        {labels.map((lbl, idx) => (
          <text 
            key={idx} 
            x={lbl.x} 
            y={lbl.y} 
            textAnchor={lbl.anchor as any} 
            className="text-[9px] font-black fill-foreground/80 tracking-tight select-none uppercase"
          >
            {lbl.text}
          </text>
        ))}
      </svg>
    </div>
  );
};

const renderMarkdown = (content: string) => {
  if (!content) return null;
  const lines = content.split("\n");
  let listItems: React.ReactNode[] = [];
  let inList = false;
  let listType: "bullet" | "ordered" = "bullet";
  const renderedElements: React.ReactNode[] = [];
  
  const flushList = (key: number) => {
    if (listItems.length > 0) {
      if (listType === "bullet") {
        renderedElements.push(
          <ul key={`list-${key}`} className="list-disc pl-5 mb-4 text-xs text-foreground/80 space-y-1">
            {listItems}
          </ul>
        );
      } else {
        renderedElements.push(
          <ol key={`list-${key}`} className="list-decimal pl-5 mb-4 text-xs text-foreground/80 space-y-1">
            {listItems}
          </ol>
        );
      }
      listItems = [];
      inList = false;
    }
  };

  const parseInlineMarkdown = (text: string) => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let index = 0;
    
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
      const codeMatch = remaining.match(/`(.*?)`/);
      
      let firstMatch: { type: "bold" | "code", index: number, length: number, content: string } | null = null;
      if (boldMatch && boldMatch.index !== undefined) {
        firstMatch = { type: "bold", index: boldMatch.index, length: boldMatch[0].length, content: boldMatch[1] };
      }
      if (codeMatch && codeMatch.index !== undefined) {
        if (!firstMatch || codeMatch.index < firstMatch.index) {
          firstMatch = { type: "code", index: codeMatch.index, length: codeMatch[0].length, content: codeMatch[1] };
        }
      }
      
      if (!firstMatch) {
        parts.push(<span key={index++}>{remaining}</span>);
        break;
      }
      
      if (firstMatch.index > 0) {
        parts.push(<span key={index++}>{remaining.slice(0, firstMatch.index)}</span>);
      }
      
      if (firstMatch.type === "bold") {
        parts.push(<strong key={index++} className="font-extrabold text-foreground">{firstMatch.content}</strong>);
      } else {
        parts.push(<code key={index++} className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px] text-pink-600">{firstMatch.content}</code>);
      }
      
      remaining = remaining.slice(firstMatch.index + firstMatch.length);
    }
    return parts.length > 0 ? parts : text;
  };

  let alertBlock: { type: string, lines: string[] } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (trimmed.startsWith(">")) {
      flushList(i);
      const contentOfQuote = trimmed.replace(/^>\s*/, "");
      
      if (contentOfQuote.startsWith("[!")) {
        const typeMatch = contentOfQuote.match(/\[!(.*?)\]/);
        const alertType = typeMatch ? typeMatch[1].toLowerCase() : "note";
        alertBlock = { type: alertType, lines: [] };
      } else if (alertBlock) {
        alertBlock.lines.push(contentOfQuote);
      } else {
        renderedElements.push(
          <blockquote key={i} className="pl-3 border-l-2 border-border text-xs italic text-muted-foreground my-3">
            {parseInlineMarkdown(contentOfQuote)}
          </blockquote>
        );
      }
      continue;
    } else if (alertBlock) {
      const type = alertBlock.type;
      const alertContent = alertBlock.lines.join(" ").trim();
      alertBlock = null;

      let alertClass = "border-l-4 bg-muted/20 border-muted p-3 my-4 rounded-r-md text-xs";
      let alertTitle = "Note";
      if (type === "tip") {
        alertClass = "border-l-4 bg-emerald-500/5 border-emerald-500 p-3 my-4 rounded-r-md text-xs text-foreground/90";
        alertTitle = "Tip";
      } else if (type === "important") {
        alertClass = "border-l-4 bg-amber-500/5 border-amber-500 p-3 my-4 rounded-r-md text-xs text-foreground/90";
        alertTitle = "Important";
      } else if (type === "warning") {
        alertClass = "border-l-4 bg-rose-500/5 border-rose-500 p-3 my-4 rounded-r-md text-xs text-foreground/90";
        alertTitle = "Warning";
      } else if (type === "caution") {
        alertClass = "border-l-4 bg-red-600/5 border-red-600 p-3 my-4 rounded-r-md text-xs text-foreground/90";
        alertTitle = "Caution";
      }

      renderedElements.push(
        <div key={`alert-${i}`} className={alertClass}>
          <p className="font-extrabold uppercase text-[9px] tracking-wider mb-0.5">{alertTitle}</p>
          <p className="text-muted-foreground leading-relaxed">{parseInlineMarkdown(alertContent)}</p>
        </div>
      );
    }

    if (trimmed === "") {
      flushList(i);
      continue;
    }

    if (trimmed === "---") {
      flushList(i);
      renderedElements.push(<Separator key={i} className="my-4" />);
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushList(i);
      renderedElements.push(
        <h1 key={i} className="text-sm font-black text-foreground border-b border-border/40 pb-1.5 mt-5 mb-3 tracking-tight">
          {parseInlineMarkdown(trimmed.substring(2))}
        </h1>
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushList(i);
      renderedElements.push(
        <h2 key={i} className="text-xs font-extrabold text-foreground mt-4 mb-2 tracking-tight">
          {parseInlineMarkdown(trimmed.substring(3))}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      if (!inList || listType !== "bullet") {
        flushList(i);
        inList = true;
        listType = "bullet";
      }
      listItems.push(
        <li key={`li-${i}`} className="leading-relaxed">
          {parseInlineMarkdown(trimmed.substring(2))}
        </li>
      );
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      if (!inList || listType !== "ordered") {
        flushList(i);
        inList = true;
        listType = "ordered";
      }
      listItems.push(
        <li key={`li-${i}`} className="leading-relaxed">
          {parseInlineMarkdown(trimmed.replace(/^\d+\.\s/, ""))}
        </li>
      );
      continue;
    }

    flushList(i);
    renderedElements.push(
      <p key={i} className="text-xs leading-relaxed text-muted-foreground mb-3.5">
        {parseInlineMarkdown(rawLine)}
      </p>
    );
  }

  flushList(lines.length);

  return <div className="space-y-1">{renderedElements}</div>;
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { user, session, supabase, loading, profile } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [category, setCategory] = useState("impromptu");
  const [moduleType, setModuleType] = useState<"public_speaking" | "interview_preparation">("public_speaking");
  const [interviewType, setInterviewType] = useState("cat_gdpi");
  const [interviewPersona, setInterviewPersona] = useState("friendly");
  const [difficulty, setDifficulty] = useState("medium");
  const [customTopic, setCustomTopic] = useState("");
  const [topics, setTopics] = useState<GeneratedTopic[]>([]);
  const [topicLoading, setTopicLoading] = useState(false);
  const [topicError, setTopicError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recordingState, setRecordingState] = useState<"idle"|"recording"|"paused"|"stopped">("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [polledSpeechId, setPolledSpeechId] = useState<string | null>(null);
  const [polledSpeechDetails, setPolledSpeechDetails] = useState<SpeechHistoryItem | null>(null);
  const [historyList, setHistoryList] = useState<SpeechHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [stats, setStats] = useState<SpeechStatistics | null>(null);
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [trackStats, setTrackStats] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"console" | "tracks" | "library" | "coach">("console");
  const [cachedIsCute, setCachedIsCute] = useState<boolean>(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<"all" | "speaking" | "interview">("all");
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [expandedReplayRound, setExpandedReplayRound] = useState<number | null>(1);
  const [rightTab, setRightTab] = useState<"feedback" | "vocab" | "progress">("feedback");
  const [metricsView, setMetricsView] = useState<"bar" | "radar">("bar");
  const [normalTheme, setNormalTheme] = useState<string>("default");
  
  const [coachReport, setCoachReport] = useState<any | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  
  const [libraryArticles, setLibraryArticles] = useState<any[]>([]);
  const [libraryRecommendations, setLibraryRecommendations] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [libraryTrack, setLibraryTrack] = useState<string | null>(null);
  const [libraryCategory, setLibraryCategory] = useState<string | null>(null);
  const [librarySearch, setLibrarySearch] = useState<string>("");
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [tracksList, setTracksList] = useState<string[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [definition, setDefinition] = useState<string | null>(null);
  const [isDefLoading, setIsDefLoading] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (selectedWord) {
        const popover = document.getElementById("word-definition-popover");
        if (popover && !popover.contains(e.target as Node)) {
          setSelectedWord(null);
          setDefinition(null);
        }
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [selectedWord]);

  const handleTextDoubleClick = async (e: React.MouseEvent) => {
    const selection = window.getSelection();
    const word = selection ? selection.toString().trim() : "";
    if (word && /^[a-zA-Z'-]+$/.test(word)) {
      setSelectedWord(word);
      setIsDefLoading(true);
      setPopoverPos({ x: e.clientX, y: e.clientY - 10 });
      
      const lookupWord = word
        .replace(/['’]s$/i, "")
        .replace(/[^a-zA-Z-]/g, "")
        .toLowerCase();

      try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${lookupWord}`);
        if (res.ok) {
          const data = await res.json();
          const firstMeaning = data[0]?.meanings[0]?.definitions[0]?.definition;
          const partOfSpeech = data[0]?.meanings[0]?.partOfSpeech;
          setDefinition(firstMeaning ? `(${partOfSpeech}) ${firstMeaning}` : "Definition not found.");
        } else {
          setDefinition("Could not find definition for this word.");
        }
      } catch (err) {
        setDefinition("Error fetching definition.");
      } finally {
        setIsDefLoading(false);
      }
    }
  };

  const handleTryAnsweringDebate = () => {
    const speech = polledSpeechDetails;
    const counterArg = speech?.feedback?.counter_argument;
    if (!speech || !counterArg) return;
    
    const newTopic: GeneratedTopic = {
      title: "Debate Counter-Response",
      prompt: counterArg,
      context: `Your previous stance was challenged by the AI coach. Defend your position and address the counter-arguments.`,
      suggested_points: speech.feedback?.challenge_questions || []
    };
    
    discardSpeechAndReset();
    setTopics([newTopic]);
    setShowDrawer(true);
  };

  const handleTryAnsweringFollowUp = () => {
    const speech = polledSpeechDetails;
    const followUp = speech?.feedback?.follow_up_question;
    if (!speech || !followUp) return;
    
    const newTopic: GeneratedTopic = {
      title: "Interviewer Follow-Up Response",
      prompt: followUp,
      context: `The interviewer asked a follow-up question based on your speech. Answer this question concisely and professionally.`,
      suggested_points: []
    };
    
    discardSpeechAndReset();
    setTopics([newTopic]);
    setShowDrawer(true);
  };


  const welcomeShownRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const pollingRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const drawerBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  }, []);
  
  useEffect(() => { fetchStats(); fetchTrackStats(); fetchLibraryRecommendations(); fetchCoachReport(); }, [session]);
  
  useEffect(() => {
    fetchHistory(1, historyFilter);
  }, [historyFilter, session]);
  
  useEffect(() => {
    if (moduleType === "public_speaking" && activeTab === "tracks") {
      setActiveTab("console");
    }
  }, [moduleType, activeTab]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("normal_theme");
      if (stored) setNormalTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("is_cute_mode");
      if (cached !== null) {
        setCachedIsCute(cached === "true");
      }
    }
  }, []);

  useEffect(() => {
    if (profile?.is_cute_mode) {
      setCachedIsCute(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("is_cute_mode", "true");
      }
    }
  }, [profile]);

  useEffect(() => {
    if (stats) {
      const isCuteMode = !!stats.is_cute_mode;
      setCachedIsCute(isCuteMode);
      if (typeof window !== "undefined") {
        localStorage.setItem("is_cute_mode", String(isCuteMode));
      }
    }
  }, [stats]);

  useEffect(() => {
    if (stats?.is_cute_mode && !welcomeShownRef.current) {
      welcomeShownRef.current = true;
      setShowWelcomeOverlay(true);
    }
  }, [stats]);
  useEffect(() => {
    if (topics.length>0 && showDrawer && drawerBodyRef.current) {
      setTimeout(() => drawerBodyRef.current?.scrollTo({top:drawerBodyRef.current.scrollHeight,behavior:"smooth"}), 200);
    }
  }, [topics, showDrawer]);

  const stopStream = (rec?: MediaRecorder|null, str?: MediaStream|null) => {
    const r=rec||mediaRecorderRef.current, s=str||streamRef.current;
    if (r&&r.state!=="inactive") r.stop();
    if (s) s.getTracks().forEach(t=>t.stop());
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; }
    setRecordingState("stopped");
  };

  const startRecording = async () => {
    setUploadError(null); setRecordSeconds(0); audioChunksRef.current=[];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
      streamRef.current=stream;
      let mime="audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) mime="audio/webm;codecs=opus";
      else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) mime="audio/ogg;codecs=opus";
      else if (MediaRecorder.isTypeSupported("audio/mp4")) mime="audio/mp4";
      const rec=new MediaRecorder(stream,{mimeType:mime});
      mediaRecorderRef.current=rec;
      rec.ondataavailable=e=>{if(e.data&&e.data.size>0)audioChunksRef.current.push(e.data);};
      rec.onstop=()=>{const b=new Blob(audioChunksRef.current,{type:mime});setAudioBlob(b);setAudioUrl(URL.createObjectURL(b));};
      rec.start(250); setRecordingState("recording");
      timerRef.current=setInterval(()=>setRecordSeconds(p=>{if(p>=300){stopStream(rec,stream);return 300;}return p+1;}),1000);
    } catch { setUploadError("Could not access microphone — please check your browser permissions."); }
  };

  const pauseRecording=()=>{if(mediaRecorderRef.current?.state==="recording"){mediaRecorderRef.current.pause();setRecordingState("paused");if(timerRef.current){clearInterval(timerRef.current);timerRef.current=null;}}};
  const resumeRecording=()=>{if(mediaRecorderRef.current?.state==="paused"){mediaRecorderRef.current.resume();setRecordingState("recording");timerRef.current=setInterval(()=>setRecordSeconds(p=>{if(p>=300){stopStream();return 300;}return p+1;}),1000);}};
  const discardRecording=()=>{stopStream();setAudioBlob(null);if(audioUrl){URL.revokeObjectURL(audioUrl);setAudioUrl(null);}setRecordSeconds(0);setRecordingState("idle");setUploadError(null);setUploadSuccess(false);};
  const discardSpeechAndReset=()=>{if(pollingRef.current){clearInterval(pollingRef.current);pollingRef.current=null;}setPolledSpeechId(null);setPolledSpeechDetails(null);discardRecording();};

  const handleSubmitSpeech=async()=>{
    if(!audioBlob||!session)return;
    const activeTopic=topics.length>0?topics[0]:null;
    if(recordSeconds<10){setUploadError("Speech must be at least 10 seconds long.");return;}
    if(audioBlob.size>30*1024*1024){setUploadError("Audio file exceeds 30 MB limit.");return;}
    setIsUploading(true);setUploadError(null);setUploadSuccess(false);
    try{
      const fd=new FormData(), ext=audioBlob.type.split(";")[0].split("/")[1]||"webm";
      fd.append("file",audioBlob,`speech_${Date.now()}.${ext}`);
      fd.append("topic_id",activeTopic?.id||"null");
      fd.append("duration_seconds",Math.round(recordSeconds).toString());
      const res=await fetch(`${getApiBaseUrl()}/api/speeches/upload`,{method:"POST",headers:{Authorization:`Bearer ${session.access_token}`},body:fd});
      if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.detail||`Error ${res.status}`);}
      const data=await res.json();setUploadSuccess(true);setShowDrawer(false);
      if(data?.id)startPollingSpeech(data.id);
    }catch(e:any){setUploadError(e.message||"Upload failed.");}
    finally{setIsUploading(false);}
  };


  const handleStartInterviewSession = async (trackId: string, stepCategory: string, stepDifficulty: string) => {
    if (!session) return;
    setTopicLoading(true);
    setTopicError(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/interviews/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          interview_type: trackId,
          difficulty: stepDifficulty,
          roadmap_step: stepCategory,
          interview_persona: interviewPersona
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to start interview session.");
      }
      const data = await res.json();
      
      discardSpeechAndReset();
      
      setActiveSession({
        session_id: data.session_id,
        interview_type: data.interview_type,
        difficulty: data.difficulty,
        roadmap_step: data.roadmap_step,
        interview_persona: data.interview_persona || interviewPersona,
        current_round: data.current_round,
        max_rounds: data.max_rounds,
        interviewer_question: data.interviewer_question,
        status: data.status,
        exchanges: [
          {
            round_number: 1,
            interviewer_question: data.interviewer_question,
            user_transcript: null,
            feedback: null,
            status: "pending"
          }
        ]
      });
      
      setActiveTab("console");
    } catch (e: any) {
      setTopicError(e.message || "Failed to start interview session.");
    } finally {
      setTopicLoading(false);
    }
  };

  const handleSubmitRoundAnswer = async () => {
    if (!audioBlob || !activeSession || !session) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      const ext = audioBlob.type.split(";")[0].split("/")[1] || "webm";
      fd.append("file", audioBlob, `round_${activeSession.current_round}.${ext}`);
      fd.append("duration_seconds", Math.round(recordSeconds).toString());
      
      const res = await fetch(
        `${getApiBaseUrl()}/api/interviews/sessions/${activeSession.session_id}/rounds/${activeSession.current_round}/answer`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`
          },
          body: fd
        }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to upload answer.");
      }
      
      setActiveSession((prev: any) => {
        if (!prev) return null;
        const updatedExchanges = [...(prev.exchanges || [])];
        const idx = updatedExchanges.findIndex(e => e.round_number === prev.current_round);
        if (idx !== -1) {
          updatedExchanges[idx] = {
            ...updatedExchanges[idx],
            status: "processing"
          };
        }
        return {
          ...prev,
          exchanges: updatedExchanges
        };
      });
      
      startPollingRound(activeSession.session_id, activeSession.current_round);
      discardRecording();
    } catch (e: any) {
      setUploadError(e.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const startPollingRound = (sessionId: string, roundNumber: number) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    pollingRef.current = setInterval(async () => {
      if (!session) return;
      try {
        const res = await fetch(
          `${getApiBaseUrl()}/api/interviews/sessions/${sessionId}/rounds/${roundNumber}/status`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` }
          }
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          
          setActiveSession((prev: any) => {
            if (!prev) return null;
            const updatedExchanges = [...(prev.exchanges || [])];
            const idx = updatedExchanges.findIndex(e => e.round_number === roundNumber);
            if (idx !== -1) {
              updatedExchanges[idx] = {
                ...updatedExchanges[idx],
                status: data.status,
                user_transcript: data.user_transcript,
                feedback: data.feedback
              };
            }
            
            if (data.next_question) {
              const nextRoundNum = roundNumber + 1;
              const hasNext = updatedExchanges.some(e => e.round_number === nextRoundNum);
              if (!hasNext) {
                updatedExchanges.push({
                  round_number: nextRoundNum,
                  interviewer_question: data.next_question,
                  user_transcript: null,
                  feedback: null,
                  status: "pending"
                });
              }
              
              return {
                ...prev,
                current_round: nextRoundNum,
                exchanges: updatedExchanges
              };
            } else if (data.session_status === "completed") {
              fetchCompletedSessionDetails(sessionId);
              return {
                ...prev,
                status: "completed",
                exchanges: updatedExchanges
              };
            }
            
            return {
              ...prev,
              exchanges: updatedExchanges
            };
          });
        }
      } catch (e) {
        console.error("Error polling round status", e);
      }
    }, 3000);
  };

  const fetchCompletedSessionDetails = async (sessionId: string) => {
    if (!session) return;
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/speeches/${sessionId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPolledSpeechId(sessionId);
        setPolledSpeechDetails(data);
        setUploadSuccess(true);

        if (data.is_session && data.status === "active") {
          setActiveSession({
            session_id: data.id,
            interview_type: data.interview_type,
            interview_persona: data.interview_persona,
            roadmap_step: data.roadmap_step || data.topics?.prompt || "Behavioral",
            difficulty: data.difficulty || "medium",
            current_round: data.current_round || (data.exchanges?.length ? Math.min(data.exchanges.length, 5) : 1),
            max_rounds: data.max_rounds || 5,
            exchanges: data.exchanges || [],
            status: data.status
          });
        } else {
          setActiveSession(null);
        }
      }
    } catch (e) {
      console.error("Error fetching completed session details", e);
    }
  };

  const handleEndInterviewEarly = async () => {
    if (!activeSession || !session) return;
    const currentSessionId = activeSession.session_id;
    try {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      await fetch(`${getApiBaseUrl()}/api/interviews/sessions/${currentSessionId}/end`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
    } catch (e) {
      console.error("Error ending session early", e);
    } finally {
      setActiveSession(null);
      fetchCompletedSessionDetails(currentSessionId);
    }
  };

  const renderActiveSessionPanel = () => {
    if (!activeSession) return null;
    
    const activePersonaName = INTERVIEW_PERSONAS.find(p => p.value === activeSession.interview_persona)?.label || formatCleanTitle(activeSession.interview_persona);
    const activeTrackName = formatInterviewType(activeSession.interview_type);
    const activeStepName = formatCleanTitle(activeSession.roadmap_step);
    const currentRound = activeSession.exchanges?.find((e: any) => e.round_number === activeSession.current_round);
    
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6 animate-bloom">
        <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Mock Interview Session</span>
              {getDifficultyBadge(activeSession.difficulty)}
            </div>
            <h1 className="text-base font-black text-foreground tracking-tight mt-1">
              {activeTrackName} · {activeStepName}
            </h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Interviewer Persona: <strong>{activePersonaName}</strong>
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEndInterviewEarly} 
            className="h-8 px-3 text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/5 hover:bg-red-500/15 border-red-500/20 hover:border-red-500/35 rounded-lg transition-all shadow-xs gap-1.5 shrink-0"
          >
            <span className="w-2 h-2 rounded-xs bg-red-500 shrink-0" />
            End Interview Early
          </Button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 select-none">
          {Array.from({ length: activeSession.max_rounds }).map((_, i) => {
            const roundNum = i + 1;
            const exch = activeSession.exchanges?.find((e: any) => e.round_number === roundNum);
            const isDone = exch && exch.status === "completed";
            const isActive = roundNum === activeSession.current_round;
            const isProcessing = exch && exch.status === "processing";
            
            return (
              <div 
                key={roundNum} 
                className={`border rounded-lg p-2 flex flex-col items-center justify-center transition-all ${
                  isDone 
                    ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-700" 
                    : isActive 
                      ? "bg-[var(--accent-bg)] border-[var(--accent-color)] text-[var(--accent-text)] ring-2 ring-[var(--accent-color)]/25"
                      : isProcessing
                        ? "bg-amber-500/10 border-amber-500/35 text-amber-700 animate-pulse"
                        : "bg-muted/30 border-border text-muted-foreground"
                }`}
              >
                <span className="text-[9px] font-bold uppercase tracking-wider">Round {roundNum}</span>
                {isDone ? (
                  <span className="text-xs mt-0.5">✓ Done</span>
                ) : isProcessing ? (
                  <span className="text-xs mt-0.5 animate-pulse">Analyzing...</span>
                ) : isActive ? (
                  <span className="text-xs mt-0.5 font-extrabold animate-pulse">Active</span>
                ) : (
                  <span className="text-xs mt-0.5 opacity-60">Locked</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 border border-border/50 rounded-xl p-4 pb-4 bg-muted/10">
          {activeSession.exchanges?.map((exch: any) => {
            return (
              <div key={exch.round_number} className="space-y-3">
                <div className="flex gap-3 max-w-[85%] items-start">
                  <div className="w-6 h-6 rounded-full bg-[var(--accent-color)] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">AI</div>
                  <div className="rounded-2xl bg-card border border-border p-3 shadow-sm">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Interviewer (Round {exch.round_number})</p>
                    <p className="text-xs text-foreground/95 leading-relaxed">{exch.interviewer_question}</p>
                  </div>
                </div>

                {(exch.user_transcript || exch.status === "processing") && (
                  <div className="flex gap-3 max-w-[85%] items-start ml-auto justify-end">
                    <div className="rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] p-3 shadow-sm text-right">
                      <p className="text-[9px] font-bold text-[var(--accent-text)] uppercase tracking-wider mb-1">You</p>
                      {exch.status === "processing" ? (
                        <div className="flex items-center gap-1.5 justify-end text-xs text-muted-foreground py-1">
                          <span className="w-3.5 h-3.5 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
                          Analyzing answer...
                        </div>
                      ) : (
                        <p className="text-xs text-foreground/95 leading-relaxed text-left">
                          {highlightTranscript(exch.user_transcript)}
                        </p>
                      )}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent-text)] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">U</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {currentRound && currentRound.status === "pending" && (
          <Card className="border-[var(--accent-border)] bg-[var(--accent-bg)]/20">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Answer (Round {activeSession.current_round} / {activeSession.max_rounds})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 flex flex-col gap-4">
              <div className="text-center">
                <p className="text-5xl font-black tracking-tighter tabular-nums text-foreground" style={{fontFamily:"'SF Mono',monospace"}}>{ft(recordSeconds)}</p>
                {recordingState==="recording"&&<div className="flex items-center justify-center gap-1.5 mt-2"><span className="rec-pulse w-2 h-2 rounded-full bg-red-500"/><span className="text-[10px] font-bold tracking-widest text-red-500">REC</span></div>}
                {recordingState==="paused"&&<p className="text-[10px] font-bold tracking-widest text-muted-foreground mt-2">PAUSED</p>}
              </div>

              {recordingState==="idle"&&(
                <Button onClick={startRecording} className="w-full gap-2" style={primaryBtnStyle}><Ic.Mic/>Start Recording</Button>
              )}
              {recordingState==="recording"&&(
                <div className="flex gap-2">
                  <Button variant="outline" onClick={pauseRecording} className="flex-1">Pause</Button>
                  <Button variant="destructive" onClick={()=>stopStream()} className="flex-1">Stop</Button>
                </div>
              )}
              {recordingState==="paused"&&(
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resumeRecording} className={`flex-1 ${accentBorderClass} ${accentTextClass}`}>Resume</Button>
                  <Button variant="destructive" onClick={()=>stopStream()} className="flex-1">Stop</Button>
                </div>
              )}
              {recordingState==="stopped"&&(
                <div className="flex flex-col gap-3">
                  <div className="rounded-lg border border-border bg-muted/40 p-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span className="font-medium text-foreground">Duration: {ft(recordSeconds)}</span>
                      {audioBlob&&<span>{(audioBlob.size/1048576).toFixed(2)} MB</span>}
                    </div>
                    <audio src={audioUrl||""} controls className="w-full h-8 rounded"/>
                  </div>
                  {recordSeconds<5&&<p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 font-medium">Your answer must be at least 5 seconds long.</p>}
                  {uploadError&&<p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 font-medium">{uploadError}</p>}
                  <div className="flex gap-2">
                    <Button onClick={handleSubmitRoundAnswer} disabled={isUploading||recordSeconds<5} className="flex-1" style={primaryBtnStyle}>
                      {isUploading?<><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2"/>Submitting...</>:"Submit Answer"}
                    </Button>
                    <Button variant="outline" onClick={discardRecording} disabled={isUploading}>Discard</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderInterviewReplayScreen = (sessionData: any) => {
    const finalEval = sessionData.final_evaluation || {};
    const exchanges = sessionData.exchanges || [];
    const activePersonaName = INTERVIEW_PERSONAS.find(p => p.value === sessionData.interview_persona)?.label || formatCleanTitle(sessionData.interview_persona);
    const activeTrackName = formatInterviewType(sessionData.interview_type);
    const activeStepName = formatCleanTitle(sessionData.roadmap_step);
    const expandedExchange = exchanges.find((e: any) => e.round_number === expandedReplayRound);

    const getSessionDuration = (sess: any): number => {
      const exchs = sess.exchanges || [];
      const sumExch = exchs.reduce((acc: number, e: any) => {
        const sec = e.duration_seconds || e.feedback?.duration_seconds || 0;
        return acc + (typeof sec === "number" ? sec : 0);
      }, 0);
      if (sumExch > 0) return sumExch;

      const raw = sess.duration_seconds || 0;
      if (raw > 1800) {
        const completedCount = exchs.filter((e: any) => e.status === "completed" || e.user_transcript)?.length || 1;
        return completedCount * 90;
      }
      return raw;
    };
    
    const getVerdictBadge = (verdict: string) => {
      const colors: Record<string, string> = {
        "Outstanding Candidate": "bg-purple-500/10 border-purple-500/20 text-purple-700",
        "Strong Candidate": "bg-emerald-500/10 border-emerald-500/20 text-emerald-700",
        "Promising Candidate": "bg-blue-500/10 border-blue-500/20 text-blue-700",
        "Average Candidate": "bg-amber-500/10 border-amber-500/20 text-amber-700",
        "Needs Improvement": "bg-red-500/10 border-red-500/20 text-red-700"
      };
      return colors[verdict] || "bg-muted border-border text-muted-foreground";
    };
    
    const getReadinessBadge = (rating: string) => {
      const colors: Record<string, string> = {
        "Interview Ready": "bg-emerald-500/10 border-emerald-500/20 text-emerald-700",
        "Mostly Ready": "bg-blue-500/10 border-blue-500/20 text-blue-700",
        "Needs More Practice": "bg-red-500/10 border-red-500/20 text-red-700"
      };
      return colors[rating] || "bg-muted border-border text-muted-foreground";
    };

    return (
      <div className="p-8 max-w-3xl space-y-6">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
          <span>History</span><Ic.Chevron/><span className="text-foreground font-medium">{activeTrackName} ({activeStepName})</span>
        </div>

        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-foreground tracking-tight mb-1">{activeTrackName} Session</h1>
            <p className="text-sm text-muted-foreground">
              {activeStepName} · {activePersonaName} Persona · {fLong(sessionData.created_at)}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setUploadSuccess(false);
                setPolledSpeechId(null);
                setPolledSpeechDetails(null);
              }} 
              className="gap-1.5 text-xs h-9 border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10 font-bold"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back to Console
            </Button>
          </div>
        </div>

        {sessionData.status === "completed" && finalEval.overall_score !== undefined && (
          <Card className="border-[var(--accent-border)] bg-gradient-to-tr from-card via-[var(--accent-bg)]/10 to-card">
            <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-16 h-16 -rotate-90">
                    <circle cx="32" cy="32" r="26" className="stroke-muted fill-none" strokeWidth="4" />
                    <circle cx="32" cy="32" r="26" 
                      className="stroke-[var(--accent-color)] fill-none" 
                      strokeWidth="4" 
                      strokeDasharray={2 * Math.PI * 26} 
                      strokeDashoffset={2 * Math.PI * 26 * (1 - finalEval.overall_score / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-black tracking-tight tabular-nums text-foreground">{finalEval.overall_score}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground -mt-1">/ 100</span>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Overall Grade</p>
                  <p className="text-xs font-black text-foreground">{scoreLabel(finalEval.overall_score)}</p>
                </div>
              </div>

              <div>
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Verdict</p>
                <Badge className={`text-[10px] font-extrabold mt-1 uppercase tracking-wider border ${getVerdictBadge(finalEval.verdict)}`}>
                  {finalEval.verdict || "N/A"}
                </Badge>
              </div>

              <div>
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Readiness Rating</p>
                <Badge className={`text-[10px] font-extrabold mt-1 uppercase tracking-wider border ${getReadinessBadge(finalEval.readiness_rating)}`}>
                  {finalEval.readiness_rating || "N/A"}
                </Badge>
              </div>

              <div>
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Session Length</p>
                <p className="text-sm font-black text-foreground mt-1">
                  {fd(getSessionDuration(sessionData))}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Round-by-Round Breakdown</p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {exchanges.map((exch: any) => {
              const isActive = expandedReplayRound === exch.round_number;
              const roundScore = exch.feedback?.round_score;
              return (
                <button
                  key={exch.round_number}
                  onClick={() => setExpandedReplayRound(exch.round_number)}
                  className={`p-3 text-left border rounded-xl flex flex-col justify-between transition-all select-none ${
                    isActive
                      ? "bg-[var(--accent-bg)] border-[var(--accent-color)] ring-2 ring-[var(--accent-color)]/20"
                      : "bg-card border-border/85 hover:bg-muted/10"
                  }`}
                >
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Round {exch.round_number}</span>
                  <div className="mt-2 flex items-baseline justify-between w-full">
                    {roundScore !== undefined ? (
                      <>
                        <span className="text-xl font-black text-foreground leading-none">{roundScore}</span>
                        <span className="text-[8px] font-medium text-muted-foreground ml-1">/100</span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {expandedExchange && (
          <Card className="border-border bg-card">
            <CardHeader className="pb-2 pt-4 px-5 border-b border-border/40 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Round {expandedExchange.round_number} details
              </CardTitle>
              {expandedExchange.feedback?.round_score !== undefined && (
                <Badge variant="secondary" className="text-[10px] font-bold">
                  Round Score: {expandedExchange.feedback.round_score}/100
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Interviewer Question</p>
                <p className="text-xs text-foreground/80 leading-relaxed italic bg-muted/20 border border-border/40 rounded-lg p-3">
                  &ldquo;{expandedExchange.interviewer_question}&rdquo;
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Your Answer</p>
                <p className="text-xs text-foreground leading-relaxed bg-muted/10 border border-border/45 rounded-lg p-3">
                  {highlightTranscript(expandedExchange.user_transcript) || "(No response recorded)"}
                </p>
              </div>

              {expandedExchange.feedback && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Confidence", score: expandedExchange.feedback.confidence },
                    { label: "Relevance", score: expandedExchange.feedback.relevance },
                    { label: "Structure", score: expandedExchange.feedback.structure }
                  ].map(item => (
                    <div key={item.label} className="border border-border/60 bg-muted/5 rounded-lg p-2.5 text-center">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                      <p className="text-base font-black text-foreground mt-0.5">{item.score !== undefined ? `${item.score}/100` : "—"}</p>
                    </div>
                  ))}
                </div>
              )}

              {expandedExchange.feedback?.written_feedback && (
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Round Performance Feedback</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {expandedExchange.feedback.written_feedback}
                  </p>
                </div>
              )}

              {expandedExchange.feedback?.lexicon_suggestions?.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Vocabulary Upgrades (Round {expandedExchange.round_number})</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {expandedExchange.feedback.lexicon_suggestions.map((s: any, i: number) => (
                      <div key={i} className="border border-border/60 bg-muted/5 rounded-lg p-3 space-y-1.5 hover:border-border transition-all">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] line-through text-muted-foreground/85 bg-muted px-1.5 py-0.5 rounded font-medium">
                            {s.original_word}
                          </span>
                          <svg className="w-3.5 h-3.5 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)]">
                            {s.suggested_replacement}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-normal font-normal">
                          {s.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {sessionData.status === "completed" && finalEval.strengths && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader className="pb-2 pt-4 px-4 border-b border-border/40">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-600">Key Strengths</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-1.5">
                  {finalEval.strengths.map((item: string, i: number) => (
                    <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                      <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2 pt-4 px-4 border-b border-border/40">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-600">Areas to Improve</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-1.5">
                  {finalEval.weaknesses?.map((item: string, i: number) => (
                    <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                      <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-2 border-border">
              <CardHeader className="pb-2 pt-4 px-4 border-b border-border/40">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-[var(--accent-color)]">Recommended Improvements</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-1.5">
                  {finalEval.recommended_improvements?.map((item: string, i: number) => (
                    <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                      <span className="text-[var(--accent-color)] shrink-0 mt-0.5">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {sessionData.status === "completed" && libraryRecommendations.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span>💡</span> AI Recommended Resources
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {libraryRecommendations.map(rec => (
                <Card 
                  key={rec.id} 
                  onClick={() => {
                    setSelectedArticle(rec);
                    setActiveTab("library");
                  }}
                  className="border-border/85 bg-card hover:border-[var(--accent-color)]/40 transition-all cursor-pointer flex flex-col justify-between p-3.5 group animate-bloom"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <span className="text-[8px] font-black uppercase text-muted-foreground tracking-wider px-1.5 py-0.5 rounded bg-muted">
                        {rec.category}
                      </span>
                      {rec.is_completed && (
                        <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">✓ Done</span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-foreground group-hover:text-[var(--accent-color)] transition-colors mb-1">
                      {rec.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">
                      {rec.content.replace(/[#*`>!\[\]]/g, "").replace(/\(https?:\/\/[^\s)]+\)/g, "").replace(/https?:\/\/[^\s]+/g, "").replace(/\s{2,}/g, " ").trim().slice(0, 100)}...
                    </p>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-[9px] font-extrabold text-[var(--accent-color)] group-hover:underline">Read Article →</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const startPollingSpeech=(id:string)=>{
    if(pollingRef.current)clearInterval(pollingRef.current);
    setPolledSpeechId(id);setPolledSpeechDetails(null);
    pollingRef.current=setInterval(async()=>{
      if(!session)return;
      try{const res=await fetch(`${getApiBaseUrl()}/api/speeches/${id}`,{headers:{Authorization:`Bearer ${session.access_token}`}});if(!res.ok)throw new Error();const data=await res.json();setPolledSpeechDetails(data);if(data.status==="completed"||data.status==="failed"){clearInterval(pollingRef.current);pollingRef.current=null;fetchHistory(1);fetchStats();fetchTrackStats();fetchLibraryRecommendations();}}catch{}
    },3000);
  };

  const getAuthHeaders = () => {
    const token = session?.access_token || "mock-developer-token";
    return { Authorization: `Bearer ${token}` };
  };

  const fetchHistory = async (page: number, filterType: string = historyFilter) => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/speeches?page=${page}&limit=10&type=${filterType}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHistoryList(data || []);
      setHistoryPage(page);
      setHasMoreHistory(data?.length === 10);
    } catch (e: any) {
      console.error("Error fetching history", e);
      setHistoryList([]);
      setHistoryPage(1);
      setHasMoreHistory(false);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/speeches/stats`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error();
      setStats(await res.json());
    } catch {
      setStats(null);
    }
  };

  const fetchTrackStats = async () => {
    if (!session) return;
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/interviews/question-bank-stats`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (!res.ok) throw new Error();
      setTrackStats(await res.json());
    } catch {
      setTrackStats({
        completed_questions: 2,
        total_questions: 15,
        average_score: 72
      });
    }
  };

  const fetchLibraryTracks = async () => {
    if (!session) return;
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/knowledge/tracks`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) setTracksList(await res.json());
    } catch (e) {
      console.error("Failed to fetch tracks", e);
    }
  };

  const fetchLibraryCategories = async (track: string | null) => {
    if (!session) return;
    try {
      let url = `${getApiBaseUrl()}/api/knowledge/categories`;
      if (track) url += `?track=${encodeURIComponent(track)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) setCategoriesList(await res.json());
    } catch (e) {
      console.error("Failed to fetch categories", e);
    }
  };

  const fetchLibraryArticles = async (track: string | null, category: string | null) => {
    if (!session) return;
    setLibraryLoading(true);
    try {
      let url = `${getApiBaseUrl()}/api/knowledge/articles`;
      const params = [];
      if (track) params.push(`track=${encodeURIComponent(track)}`);
      if (category) params.push(`category=${encodeURIComponent(category)}`);
      if (params.length > 0) url += `?${params.join("&")}`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) setLibraryArticles(await res.json());
    } catch (e) {
      console.error("Failed to fetch articles", e);
    } finally {
      setLibraryLoading(false);
    }
  };

  const fetchLibraryRecommendations = async () => {
    if (!session) return;
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/knowledge/recommendations`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) setLibraryRecommendations(await res.json());
    } catch (e) {
      setLibraryRecommendations([
        {
          id: "rec-1",
          title: "Pacing & Pause Masterclass",
          category: "Pacing",
          content: "Learn how to slow down your speaking rate and introduce powerful silence that commands attention."
        },
        {
          id: "rec-2",
          title: "Eliminating Filler Words",
          category: "Vocabulary",
          content: "A guide to recognizing and systematically removing words like 'um', 'like', and 'basically' from your speeches."
        }
      ]);
    }
  };

  const handleMarkArticleCompleted = async (articleId: string) => {
    if (!session) return;
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/knowledge/articles/${articleId}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        if (selectedArticle && selectedArticle.id === articleId) {
          setSelectedArticle((prev: any) => ({ ...prev, is_completed: true }));
        }
        setLibraryArticles(prev => 
          prev.map(art => art.id === articleId ? { ...art, is_completed: true } : art)
        );
        setLibraryRecommendations(prev =>
          prev.map(art => art.id === articleId ? { ...art, is_completed: true } : art)
        );
        fetchLibraryRecommendations();
      }
    } catch (e) {
      console.error("Failed to complete article", e);
    }
  };

  const fetchCoachReport = async () => {
    if (!session) return;
    setCoachLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/coach/report`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        setCoachReport(await res.json());
      } else {
        throw new Error();
      }
    } catch (e) {
      setCoachReport({
        unlocked: true,
        report: {
          readiness_level: "High",
          readiness_description: "You have shown consistent improvement in your speech clarity and structured delivery. Your pace is stable, and you are ready for standard technical interview presentations.",
          recommended_focus: "Refining lexicon variety and advanced transition connectors.",
          strongest_skill: "Structure & Flow",
          weakest_skill: "Vocabulary Range",
          most_improved_skill: "Pacing Stability",
          trend_metrics: [
            { skill: "Clarity & Enunciation", change_percentage: 12 },
            { skill: "Pacing & Pauses", change_percentage: 8 },
            { skill: "Grammar & Accuracy", change_percentage: 3 },
            { skill: "Vocabulary & Lexicon", change_percentage: -2 }
          ]
        }
      });
    } finally {
      setCoachLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "coach" && session) {
      fetchCoachReport();
      if (libraryArticles.length === 0) {
        fetchLibraryArticles(null, null);
      }
    }
  }, [activeTab, session, libraryArticles.length]);

  useEffect(() => {
    if (activeTab === "library" && session) {
      fetchLibraryTracks();
      fetchLibraryCategories(libraryTrack);
      fetchLibraryArticles(libraryTrack, libraryCategory);
      fetchLibraryRecommendations();
    }
  }, [activeTab, libraryTrack, libraryCategory, session]);

  const handleLogout=async()=>{if(!supabase)return;setLogoutLoading(true);try{await supabase.auth.signOut();router.replace("/login");}catch{}finally{setLogoutLoading(false);}};

  const handleGenerateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopicLoading(true);
    setTopicError(null);
    discardRecording();
    try {
      let url = `${getApiBaseUrl()}/api/topics/generate?module_type=${moduleType}&difficulty=${difficulty}`;
      if (moduleType === "public_speaking") {
        url += `&category=${category}`;
      } else {
        url += `&interview_type=${interviewType}&interview_persona=${interviewPersona}`;
      }
      if (customTopic.trim()) url += `&custom_topic=${encodeURIComponent(customTopic.trim())}`;
      
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Error ${res.status}`);
      }
      const data = await res.json();
      if (data?.topics) setTopics(data.topics);
    } catch (e: any) {
      setTopicError(e.message || "Failed to generate topic.");
    } finally {
      setTopicLoading(false);
    }
  };

  const handleGenerateTrackQuestion = async (trackId: string, stageCategory: string, stageDifficulty: string) => {
    setTopicLoading(true);
    setTopicError(null);
    setActiveTab("console");
    discardRecording();
    try {
      const url = `${getApiBaseUrl()}/api/topics/generate?module_type=interview_preparation&interview_type=${trackId}&category=${encodeURIComponent(stageCategory)}&difficulty=${stageDifficulty}&interview_persona=${interviewPersona}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Error ${res.status}`);
      }
      const data = await res.json();
      if (data?.topics) setTopics(data.topics);
    } catch (e: any) {
      setTopicError(e.message || "Failed to generate topic.");
    } finally {
      setTopicLoading(false);
    }
  };

  const getGroupedHistory = () => {
    const today: SpeechHistoryItem[] = [];
    const yesterday: SpeechHistoryItem[] = [];
    const thisWeek: SpeechHistoryItem[] = [];
    const older: SpeechHistoryItem[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const startOfThisWeek = startOfToday - 7 * 24 * 60 * 60 * 1000;

    const filtered = historyList.filter(item => {
      if (historyFilter === "speaking") return !item.is_session;
      if (historyFilter === "interview") return item.is_session;
      return true;
    });

    filtered.forEach(item => {
      const time = new Date(item.created_at).getTime();
      if (time >= startOfToday) {
        today.push(item);
      } else if (time >= startOfYesterday) {
        yesterday.push(item);
      } else if (time >= startOfThisWeek) {
        thisWeek.push(item);
      } else {
        older.push(item);
      }
    });

    return [
      { label: "Today", items: today },
      { label: "Yesterday", items: yesterday },
      { label: "This Week", items: thisWeek },
      { label: "Older", items: older },
    ].filter(group => group.items.length > 0);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-sm text-muted-foreground">Verifying session...</p></div>;
  if (!user) return null;

  const isCute       = false;
  const activeTopic  = topics.length>0?topics[0]:null;
  const speech       = polledSpeechDetails;
  const isProcessing = uploadSuccess&&(!speech||(speech.status!=="completed"&&speech.status!=="failed"));
  const isCompleted  = uploadSuccess&&speech?.status==="completed";
  const isFailed     = uploadSuccess&&speech?.status==="failed";
  const coachFeedback = speech?.feedback?.written_feedback ? parseCoachFeedback(speech.feedback.written_feedback) : [];
  const lexiconSuggestions = speech?.feedback?.lexicon_suggestions||[];
  const counterArgument = speech?.feedback?.counter_argument;

  const accentBorderClass = "border-[var(--accent-border)]";
  const accentTextClass   = "text-[var(--accent-text)]";
  const accentBgClass     = "bg-[var(--accent-bg)]";
  const primaryBtnStyle   = {};
  const shouldHideAds     = recordingState !== "idle" || isProcessing || (!!speech && rightTab !== "progress");
  const themeRoot         = normalTheme === "light" ? "theme-light" : "theme-dark";

  const feedbackBorder = { positive: "border-l-emerald-500", warning: "border-l-amber-400", tip: "border-l-[var(--accent-color)]" };
  const skillGradients = [
    "linear-gradient(90deg, #2563eb, #3b82f6)",
    "linear-gradient(90deg, #0ea5e9, #38bdf8)",
    "linear-gradient(90deg, #0d9488, #14b8a6)",
    "linear-gradient(90deg, #059669, #10b981)",
    "linear-gradient(90deg, #0891b2, #06b6d4)"
  ];

  const scoreVariant = (s: number|null): "default"|"secondary"|"destructive" =>
    !s ? "secondary" : s>=80 ? "default" : s>=65 ? "secondary" : "destructive";

  const renderCuteProgress = () => {
    if (!stats) return (
      <div className="text-center py-8 text-xs text-muted-foreground animate-bloom">
        <div className="flex flex-col items-center gap-1.5 opacity-60">
          <span className="text-lg animate-float-leaf">🌱</span>
          <p className="text-[10px] text-[#2d5a37] font-semibold">Garden seedling box is empty.</p>
          <p className="text-[9px] text-muted-foreground">Practice once to plant your first seed!</p>
        </div>
      </div>
    );

    return (
      <div className="space-y-4 animate-bloom">
        {/* Growing Daffodil Row (Streak) */}
        <Card className="border-[rgba(21,46,27,0.14)] bg-white/40 overflow-hidden relative shadow-sm">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-[#2d5a37]">Streak Sprouts</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 flex flex-col items-center text-center">
            {/* Daffodil row streaks */}
            <div className="flex justify-center gap-2.5 py-3 w-full border-b border-[rgba(21,46,27,0.08)] mb-2.5">
              {Array.from({ length: 5 }).map((_, idx) => {
                const active = stats.current_streak > idx;
                const phase = active ? (stats.current_streak - idx >= 3 ? "bloom" : stats.current_streak - idx >= 2 ? "bud" : "sprout") : "seed";
                return (
                  <div key={idx} className="flex flex-col items-center gap-1 select-none">
                    {/* Small pot with flower */}
                    <div className="w-9 h-9 flex items-center justify-center relative">
                      {phase === "seed" && (
                        <svg className="w-6 h-6 text-[#a16207]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19h12c.6 0 1-.4 1-1v-4H5v4c0 .6.4 1 1 1z" fill="#78350f" />
                          <circle cx="12" cy="11" r="1.5" fill="#451a03" />
                        </svg>
                      )}
                      {phase === "sprout" && (
                        <svg className="w-7 h-7 text-[#568764] animate-float-leaf" style={{ "--delay": `${idx*0.2}s` } as any} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19h12c.6 0 1-.4 1-1v-4H5v4c0 .6.4 1 1 1z" fill="#78350f" stroke="#451a03" strokeWidth="0.5" />
                          <path d="M12 14v-4c0 0-1.5-.8-2.2-.8s-1.8 1.2-1.8 2.2c0 1.5 1.8 2.2 4 2.2z" fill="#4ade80" />
                          <path d="M12 14v-5" stroke="#15803d" strokeWidth="1.5" />
                        </svg>
                      )}
                      {phase === "bud" && (
                        <svg className="w-7 h-7 text-[#eab308] animate-float-leaf" style={{ "--delay": `${idx*0.2}s` } as any} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19h12c.6 0 1-.4 1-1v-4H5v4c0 .6.4 1 1 1z" fill="#78350f" stroke="#451a03" strokeWidth="0.5" />
                          <path d="M12 14v-5" stroke="#15803d" strokeWidth="1.8" />
                          <path d="M12 9c-1.2 0-2.2.9-2.2 2.2S11 14 12 14s2.2-.9 2.2-2.2S13.2 9 12 9z" fill="#fef08a" />
                          <circle cx="12" cy="11.2" r="1.5" fill="#eab308" />
                        </svg>
                      )}
                      {phase === "bloom" && (
                        <div className="relative flex items-center justify-center">
                          <svg className="w-8 h-8 text-[#fbbf24] animate-float-flower" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19h12c.6 0 1-.4 1-1v-4H5v4c0 .6.4 1 1 1z" fill="#78350f" stroke="#451a03" strokeWidth="0.5" />
                            <path d="M12 14v-6" stroke="#15803d" strokeWidth="2" />
                            <circle cx="12" cy="8" r="2" fill="#854d0e" />
                            <circle cx="12" cy="4.5" r="1.5" fill="#ffd84d" />
                            <circle cx="12" cy="11.5" r="1.5" fill="#ffd84d" />
                            <circle cx="8.5" cy="8" r="1.5" fill="#ffd84d" />
                            <circle cx="15.5" cy="8" r="1.5" fill="#ffd84d" />
                          </svg>
                          <span className="absolute -top-1 -right-1 text-[10px] animate-sparkle">✨</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-[#2d5a37]/80 font-mono">Day {idx + 1}</span>
                  </div>
                );
              })}
            </div>
            
            <p className="text-xs font-black text-[#112615]">
              {(!stats.current_streak || stats.current_streak === 0) ? "Plant a Seed!" : stats.current_streak <= 2 ? "Sprouted!" : stats.current_streak <= 4 ? "Budding Daffodils!" : "Fully Bloomed Daffodils!"}
            </p>
            <p className="text-[9px] text-[#2d5a37]/80 mt-0.5 font-medium">
              You have a {stats.current_streak || 0}-day garden streak!
            </p>
          </CardContent>
        </Card>

        {/* Vocabulary Garden / Growth Stem */}
        <Card className="border-[rgba(21,46,27,0.14)] bg-white/40 overflow-hidden shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-[#2d5a37]">Garden Growth</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="flex justify-between items-center text-[10px] text-[#2d5a37] mb-1">
              <span>Overall Progress</span>
              <span className="font-extrabold">{stats.average_overall_score}%</span>
            </div>
            
            {/* Custom leaf-bud progress stem */}
            <div className="relative h-6 bg-muted/30 rounded-full border border-[rgba(86,135,100,0.15)] flex items-center px-1 overflow-visible">
              <div 
                className="h-3.5 bg-gradient-to-r from-[#6b9a50] to-[#80b95d] rounded-full transition-all duration-1000 relative flex items-center justify-end" 
                style={{ width: `${Math.max(10, Math.min(100, stats.average_overall_score))}%` }}
              >
                <span className="absolute left-[30%] -top-1.5 text-[8px] transform -rotate-12 select-none">🍃</span>
                <span className="absolute left-[60%] -bottom-1.5 text-[8px] transform rotate-12 select-none">🍃</span>
                
                <div className="w-5 h-5 rounded-full bg-[#ffd84d] border border-amber-300 flex items-center justify-center text-[10px] shadow-sm transform translate-x-2.5 shrink-0 z-10 animate-bounce">
                  {stats.average_overall_score >= 80 ? "🌼" : "🌱"}
                </div>
              </div>
            </div>
            <p className="text-[8px] text-muted-foreground leading-normal text-center">
              {stats.average_overall_score >= 80 ? "Your garden is in full bloom! Outstanding job!" : "Your seedling is climbing up the stem. Keep going!"}
            </p>
          </CardContent>
        </Card>

        {/* Milestones (Hexagonal Badges) */}
        <Card className="border-[rgba(21,46,27,0.14)] bg-white/40 overflow-hidden shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-[#2d5a37]">Garden Badges</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            {(() => {
              const renderMilestoneProgress = (current: number, target: number) => {
                const pct = Math.min(100, (current / target) * 100);
                return (
                  <div className="mt-1 w-full max-w-[130px]">
                    <div className="flex justify-between items-center text-[10px] text-[#2d5a37]/75 font-black uppercase mb-0.5">
                      <span>Progress</span>
                      <span>{current}/{target}</span>
                    </div>
                    <div className="h-1 rounded-full bg-muted overflow-hidden relative">
                      <div className="h-full rounded-full bg-[#fb7185] transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              };

              return (
                <>
                  <div className="flex items-center gap-3 p-2 rounded-lg border border-[rgba(21,46,27,0.08)] bg-white/30 transition-all hover:border-[var(--accent-color)]">
                    <div 
                      className={`w-9 h-9 flex items-center justify-center text-sm shadow-sm shrink-0 transition-transform duration-500 hover:scale-110
                        ${stats.completed_speeches >= 1 ? "bg-[#ffe4e6] text-[#be123c] border border-rose-300 animate-bloom" : "bg-muted text-muted-foreground/45 border border-border"}`}
                      style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                    >
                      🌱
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-extrabold text-[#112615]">Sprout Badge</p>
                      <p className="text-[8px] text-muted-foreground mt-0.5 leading-none">Completed 1st practice session</p>
                      {stats.completed_speeches < 1 && renderMilestoneProgress(stats.completed_speeches, 1)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg border border-[rgba(21,46,27,0.08)] bg-white/30 transition-all hover:border-[var(--accent-color)]">
                    <div 
                      className={`w-9 h-9 flex items-center justify-center text-sm shadow-sm shrink-0 transition-transform duration-500 hover:scale-110
                        ${stats.completed_speeches >= 5 ? "bg-amber-100 text-amber-700 border border-amber-300 animate-bloom" : "bg-muted text-muted-foreground/45 border border-border"}`}
                      style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                    >
                      🪴
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-extrabold text-[#112615]">Budding Speaker</p>
                      <p className="text-[8px] text-muted-foreground mt-0.5 leading-none">Completed 5 practice sessions</p>
                      {stats.completed_speeches < 5 && renderMilestoneProgress(stats.completed_speeches, 5)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg border border-[rgba(21,46,27,0.08)] bg-white/30 transition-all hover:border-[var(--accent-color)]">
                    <div 
                      className={`w-9 h-9 flex items-center justify-center text-sm shadow-sm shrink-0 relative transition-transform duration-500 hover:scale-110
                        ${stats.completed_speeches >= 10 ? "bg-[#fef9c3] text-[#854d0e] border border-yellow-300 animate-bloom" : "bg-muted text-muted-foreground/45 border border-border"}`}
                      style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                    >
                      🌼
                      {stats.completed_speeches >= 10 && <span className="absolute -top-1 -right-1 text-[8px] animate-sparkle">✨</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-extrabold text-[#112615]">Daffodil Master</p>
                      <p className="text-[8px] text-muted-foreground mt-0.5 leading-none">Completed 10+ practice sessions</p>
                      {stats.completed_speeches < 10 && renderMilestoneProgress(stats.completed_speeches, 10)}
                    </div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>

        {/* Companion Cushion Card (Bottom of Right Sidebar) */}
        <Card className="border-[rgba(236,72,153,0.18)] bg-white/45 backdrop-blur-md overflow-hidden relative shadow-sm hover:border-[rgba(236,72,153,0.35)] transition-all">
          <CardContent className="p-4 flex flex-col items-center">
            {/* Speech bubble */}
            <div className="relative bg-white/95 border border-[rgba(236,72,153,0.15)] rounded-2xl p-2.5 mb-3 text-[10px] text-[var(--accent-text)] font-semibold shadow-sm leading-normal max-w-[200px] text-center anim-fadeup">
              {stats.completed_speeches > 0 ? (
                <span>&quot;I&apos;m so proud of your practice today! Let&apos;s keep growing together!&quot;</span>
              ) : (
                <span>&quot;*Yawn*... I&apos;m ready to practice when you are! Let&apos;s grow some daffodils!&quot;</span>
              )}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 border-r border-b border-[rgba(236,72,153,0.15)] rotate-45" />
            </div>
            
            {/* Cushion and Puppy */}
            <div className="relative w-28 h-24 flex flex-col items-center justify-end">
              <div className="absolute bottom-0 w-24 h-6 bg-[#fbcfe8] rounded-full border border-pink-300 shadow-md flex items-center justify-center">
                <div className="w-20 h-4 bg-[#fbcfe8]/40 border border-dotted border-pink-400 rounded-full" />
              </div>
              <img 
                src="/cute_garden_puppy.png" 
                alt="Garden Companion" 
                className="w-20 h-20 object-contain z-10 mb-1.5 animate-bounce" 
                style={{ animationDuration: '7s' }}
              />
            </div>
            
            {/* Heart Relationship Streak */}
            <div className="flex items-center gap-1 mt-3">
              <span className="text-[8px] font-black uppercase text-pink-500 tracking-wider">Friendship:</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => {
                  const filled = stats.completed_speeches > i * 2;
                  return (
                    <span key={i} className={`text-xs transition-transform duration-500 hover:scale-125 ${filled ? "text-pink-500 animate-pulse" : "text-muted-foreground/30"}`}>
                      ❤️
                    </span>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDefaultProgress = () => {
    if (!stats) return <div className="text-center py-8 text-xs text-muted-foreground">No progress stats available.</div>;
    return (
      <Card className="border border-border">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-primary" /> Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          
          {/* Average Score */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">Average Score</span>
              <span className="font-extrabold text-primary tabular-nums">{stats.average_overall_score}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${stats.average_overall_score}%` }} />
            </div>
          </div>

          {/* Best Score */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">Best Score</span>
              <span className="font-extrabold text-emerald-500 tabular-nums">{stats.best_overall_score}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${stats.best_overall_score}%` }} />
            </div>
          </div>

          <div className="h-[1px] bg-border/60 my-2" />

          {/* Streak & Sessions Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 border border-border/40 rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current Streak</p>
              <p className="text-lg font-black text-amber-500 mt-1 tabular-nums">{stats.current_streak} days</p>
            </div>
            <div className="bg-muted/30 border border-border/40 rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Sessions</p>
              <p className="text-lg font-black text-foreground mt-1 tabular-nums">{stats.completed_speeches}</p>
            </div>
          </div>

        </CardContent>
      </Card>
    );
  };

  const renderLeafDivider = () => {
    return (
      <div className="flex items-center justify-center gap-2 my-3 opacity-65 select-none pointer-events-none">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[rgba(45,90,55,0.18)] to-transparent" />
        <span className="text-[9px] tracking-widest font-bold text-[#2d5a37]/65">🍃 ✦ 🌼 ✦ 🍃</span>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[rgba(45,90,55,0.18)] to-transparent" />
      </div>
    );
  };

  const TRACKS_METADATA: Record<string, { label: string, desc: string, icon: string, stages: { label: string, difficulty: "easy" | "medium" | "hard", category: string }[] }> = {
    cat_gdpi: {
      label: "CAT GDPI & MBA Admissions",
      desc: "Targeting top-tier IIMs and business schools in India.",
      icon: "🎓",
      stages: [
        { label: "Personal Introduction", difficulty: "easy", category: "Personal Introduction" },
        { label: "Academics", difficulty: "easy", category: "Academics" },
        { label: "Work Experience", difficulty: "medium", category: "Work Experience" },
        { label: "Current Affairs", difficulty: "medium", category: "Current Affairs" },
        { label: "Leadership", difficulty: "medium", category: "Leadership" },
        { label: "Why MBA", difficulty: "easy", category: "Why MBA" },
        { label: "Mock Interview", difficulty: "hard", category: "Mock Interview" }
      ]
    },
    upsc_interview: {
      label: "UPSC Civil Services",
      desc: "Personality test preparation for IAS, IPS, and IFS aspirants.",
      icon: "🏛️",
      stages: [
        { label: "Personal Background", difficulty: "easy", category: "Personal Background" },
        { label: "Graduation Subject", difficulty: "easy", category: "Graduation Subject" },
        { label: "State Knowledge", difficulty: "medium", category: "State Knowledge" },
        { label: "Current Affairs", difficulty: "medium", category: "Current Affairs" },
        { label: "Ethics", difficulty: "medium", category: "Ethics" },
        { label: "Governance", difficulty: "hard", category: "Governance" },
        { label: "Mock Board", difficulty: "hard", category: "Mock Board" }
      ]
    },
    software_engineering: {
      label: "Software Engineering",
      desc: "Tech industry preparation covering DSA, System Design, and projects.",
      icon: "💻",
      stages: [
        { label: "Behavioral", difficulty: "easy", category: "Behavioral" },
        { label: "Internships / Experience", difficulty: "easy", category: "Internships / Work Experience" },
        { label: "Projects", difficulty: "medium", category: "Projects" },
        { label: "DSA & Algorithms", difficulty: "medium", category: "DSA" },
        { label: "System Design", difficulty: "hard", category: "System Design" },
        { label: "Mock Technical Interview", difficulty: "hard", category: "Mock Interview" }
      ]
    }
  };

  const renderInterviewTracks = () => {
    if (activeTrack) {
      const track = TRACKS_METADATA[activeTrack];
      const statsForTrack = trackStats?.[activeTrack];
      
      const completedCount = statsForTrack?.stage_completion 
        ? Object.values(statsForTrack.stage_completion).filter((s: any) => s.completed).length 
        : 0;
      
      return (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{track.icon}</span>
            <div>
              <h2 className="text-base font-black text-foreground">{track.label}</h2>
              <p className="text-[10px] text-muted-foreground">{track.desc}</p>
            </div>
          </div>
          
          <Card className="border-border/85 bg-card">
            <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Stages Completed", value: `${completedCount} / ${track.stages.length}`, color: "text-blue-600" },
                { label: "Average Score", value: statsForTrack?.average_score ? `${statsForTrack.average_score}%` : "—", color: "text-foreground" },
                { label: "Best Score", value: statsForTrack?.best_score ? `${statsForTrack.best_score}%` : "—", color: "text-emerald-600" },
                { label: "Weak Areas", value: statsForTrack?.weak_areas && statsForTrack.weak_areas.length > 0 ? statsForTrack.weak_areas.join(", ") : "None detected", color: "text-amber-600" }
              ].map(stat => (
                <div key={stat.label} className="space-y-0.5 border-r last:border-0 border-border/50 pr-2">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{stat.label}</p>
                  <p className={`text-sm font-black tracking-tight ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="border-border/85 bg-card overflow-hidden">
            <CardHeader className="pb-2 pt-4 px-4 border-b border-border/40">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Roadmap stages</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {track.stages.map((stage, idx) => {
                  const getStageCompletion = (index: number) => {
                    if (!statsForTrack?.stage_completion) return null;
                    const stageIds = activeTrack === "cat_gdpi"
                      ? ["intro", "academics", "work_exp", "current_affairs", "leadership", "why_mba", "mock"]
                      : activeTrack === "upsc_interview"
                        ? ["personal", "subject", "state", "current_affairs", "ethics", "governance", "mock"]
                        : ["behavioral", "internship", "projects", "dsa", "system_design", "mock"];
                    const sid = stageIds[index];
                    return statsForTrack.stage_completion[sid];
                  };
                  
                  const statusInfo = getStageCompletion(idx);
                  const isCompleted = statusInfo?.completed === true;
                  const score = statusInfo?.score;
                  
                  return (
                    <div key={stage.label} className="p-4 flex items-center justify-between gap-4 transition-all hover:bg-muted/10">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border transition-all ${
                          isCompleted 
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" 
                            : "bg-muted/40 border-border text-muted-foreground"
                        }`}>
                          {isCompleted ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          ) : (
                            idx + 1
                          )}
                        </div>
                        
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-foreground truncate">{stage.label}</p>
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border ${
                              stage.difficulty === "easy" 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" 
                                : stage.difficulty === "medium" 
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-600" 
                                  : "bg-destructive/10 border-destructive/20 text-destructive"
                            }`}>
                              {stage.difficulty}
                            </span>
                          </div>
                          <p className="text-[9px] text-muted-foreground mt-0.5">
                            {isCompleted ? `Completed · Score: ${score}%` : "Not started"}
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        variant={isCompleted ? "outline" : "default"} 
                        size="xs" 
                        onClick={() => handleStartInterviewSession(activeTrack, stage.category, stage.difficulty)}
                        className={`text-[10px] font-bold h-7 shrink-0 ${!isCompleted ? "bg-[var(--accent-color)] text-white hover:bg-[var(--accent-color)]/90" : ""}`}
                        style={!isCompleted ? primaryBtnStyle : {}}
                      >
                        {isCompleted ? "Retake" : "Start"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Available Pathways</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(TRACKS_METADATA).map(([id, track]) => {
              const statsForTrack = trackStats?.[id];
              const completedCount = statsForTrack?.stage_completion 
                ? Object.values(statsForTrack.stage_completion).filter((s: any) => s.completed).length 
                : 0;
              
              return (
                <Card 
                  key={id} 
                  className="border-border/85 bg-card hover:border-[var(--accent-color)]/40 transition-all cursor-pointer group flex flex-col justify-between"
                  onClick={() => setActiveTrack(id)}
                >
                  <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                    <span className="text-xl p-2 rounded-lg bg-muted/60">{track.icon}</span>
                    <span className="text-[9px] font-extrabold uppercase bg-muted px-2 py-0.5 rounded-full text-muted-foreground group-hover:bg-[var(--accent-color)]/10 group-hover:text-[var(--accent-color)] transition-colors">
                      {completedCount} / {track.stages.length} Completed
                    </span>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 flex-1">
                    <CardTitle className="text-xs font-black text-foreground mb-1 group-hover:text-[var(--accent-color)] transition-colors">{track.label}</CardTitle>
                    <p className="text-[9px] text-muted-foreground leading-relaxed">{track.desc}</p>
                  </CardContent>
                  <div className="p-4 pt-0">
                    <Button variant="ghost" size="xs" className="w-full text-[10px] font-bold h-7 hover:bg-[var(--accent-color)] hover:text-white border border-border group-hover:border-[var(--accent-color)]/30 transition-all">
                      Open Pathway →
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderKnowledgeLibrary = () => {
    const filteredArticles = libraryArticles.filter(art => {
      if (librarySearch) {
        const q = librarySearch.toLowerCase();
        const matchTitle = art.title.toLowerCase().includes(q);
        const matchTags = art.tags?.some((t: string) => t.toLowerCase().includes(q));
        const matchContent = art.content.toLowerCase().includes(q);
        return matchTitle || matchTags || matchContent;
      }
      return true;
    });

    return (
      <div className="space-y-6">
        {/* Welcome / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-foreground tracking-tight">Preparation Library</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Read curated articles, learn preparation frameworks, and practice smarter.
            </p>
          </div>
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Ic.Search />
            </span>
            <Input
              type="text"
              placeholder="Search articles or tags..."
              value={librarySearch}
              onChange={e => setLibrarySearch(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>
        </div>

        {/* Track Pills Filter */}
        <div className="flex flex-wrap gap-1.5 border-b border-border/40 pb-3">
          <button
            onClick={() => {
              setLibraryTrack(null);
              setLibraryCategory(null);
            }}
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all border ${
              libraryTrack === null
                ? "bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-sm"
                : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
            }`}
            style={libraryTrack === null ? primaryBtnStyle : {}}
          >
            All Pathways
          </button>
          {Object.entries(TRACKS_METADATA).map(([id, track]) => (
            <button
              key={id}
              onClick={() => {
                setLibraryTrack(id);
                setLibraryCategory(null);
              }}
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all border flex items-center gap-1 ${
                libraryTrack === id
                  ? "bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-sm"
                  : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
              }`}
              style={libraryTrack === id ? primaryBtnStyle : {}}
            >
              <span>{track.icon}</span>
              <span>{track.label.replace(" & MBA Admissions", "").replace(" Civil Services", "")}</span>
            </button>
          ))}
        </div>

        {/* Category Filter Pills (only when a track is selected) */}
        {libraryTrack && categoriesList.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setLibraryCategory(null)}
              className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold transition-all border ${
                libraryCategory === null
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              All Categories
            </button>
            {categoriesList.map(cat => (
              <button
                key={cat}
                onClick={() => setLibraryCategory(cat)}
                className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold transition-all border ${
                  libraryCategory === cat
                    ? "bg-foreground text-background border-foreground shadow-sm"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* AI Recommendations section */}
        {libraryRecommendations.length > 0 && !libraryTrack && !libraryCategory && !librarySearch && (
          <div className="space-y-2.5 animate-bloom">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-color)] flex items-center gap-1.5">
              <span className="animate-pulse">💡</span> Recommended for You
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {libraryRecommendations.map(rec => (
                <Card
                  key={rec.id}
                  onClick={() => setSelectedArticle(rec)}
                  className="border-[var(--accent-border)] bg-gradient-to-br from-card via-[var(--accent-bg)]/5 to-card hover:border-[var(--accent-color)]/60 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-8 h-8 bg-[var(--accent-color)]/10 rounded-bl-full flex items-center justify-center pointer-events-none">
                    <span className="text-xs -mt-1 -mr-1">✨</span>
                  </div>
                  <CardHeader className="p-4 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground">
                        {(rec.track && TRACKS_METADATA[rec.track]?.icon) || "📚"} {rec.category}
                      </span>
                      {rec.difficulty && (
                        <Badge variant="secondary" className="text-[8px] uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {rec.difficulty}
                        </Badge>
                      )}
                      {rec.is_completed && (
                        <span className="text-[8px] font-bold text-emerald-600 flex items-center gap-0.5 ml-auto">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <CardTitle className="text-xs font-black text-foreground mb-1 group-hover:text-[var(--accent-color)] transition-colors">
                      {rec.title}
                    </CardTitle>
                    <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                      {rec.content.replace(/[#*`>!\[\]]/g, "").replace(/\(https?:\/\/[^\s)]+\)/g, "").replace(/https?:\/\/[^\s]+/g, "").replace(/\s{2,}/g, " ").trim().slice(0, 110)}...
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[9px]">
                      <div className="flex gap-1.5 flex-wrap">
                        {rec.tags?.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-muted-foreground">#{tag}</span>
                        ))}
                      </div>
                      <span className="font-extrabold text-[var(--accent-color)] group-hover:underline">Read Now →</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {libraryTrack ? `${TRACKS_METADATA[libraryTrack]?.label} Articles` : "All Library Articles"} ({filteredArticles.length})
          </h3>
          
          {libraryLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 bg-muted/10 border border-border/50 rounded-xl">
              <span className="w-5 h-5 border-2 border-[var(--accent-color)]/35 border-t-[var(--accent-color)] rounded-full animate-spin" />
              <p className="text-[10px] text-muted-foreground font-medium">Loading preparation library...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <p className="text-xs text-muted-foreground font-medium">No articles found matching filters.</p>
              {librarySearch && (
                <Button variant="link" size="xs" onClick={() => setLibrarySearch("")} className="text-[10px] text-[var(--accent-color)] font-bold mt-1">
                  Clear search query
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredArticles.map(art => (
                <Card
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className="border-border/85 bg-card hover:border-[var(--accent-color)]/45 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground">
                        {TRACKS_METADATA[art.track]?.icon || "📚"} {art.category}
                      </span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                        art.difficulty === "easy"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                          : art.difficulty === "medium"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-600"
                            : "bg-destructive/10 border-destructive/20 text-destructive"
                      }`}>
                        {art.difficulty}
                      </span>
                      {art.is_completed && (
                        <span className="text-[8px] font-bold text-emerald-600 flex items-center gap-0.5 ml-auto">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-1 flex-1 flex flex-col justify-between">
                    <div>
                      <CardTitle className="text-xs font-black text-foreground mb-1 group-hover:text-[var(--accent-color)] transition-colors">
                        {art.title}
                      </CardTitle>
                      <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                        {art.content.replace(/[#*`>!\[\]]/g, "").replace(/\(https?:\/\/[^\s)]+\)/g, "").replace(/https?:\/\/[^\s]+/g, "").replace(/\s{2,}/g, " ").trim().slice(0, 110)}...
                      </p>
                    </div>
                    <div className="mt-3.5 flex items-center justify-between text-[9px] border-t border-border/30 pt-2.5">
                      <div className="flex gap-1.5 flex-wrap">
                        {art.tags?.map((tag: string) => (
                          <span key={tag} className="text-muted-foreground">#{tag}</span>
                        ))}
                      </div>
                      <span className="font-extrabold text-[var(--accent-color)] group-hover:underline">Read →</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Selected Article Modal moved to global level */}
      </div>
    );
  };

  const renderAICoach = () => {
    if (coachLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          {isCute ? (
            <>
              <img src="/cute_sleeping_puppy.png" alt="Sleeping Puppy" className="w-24 h-24 object-contain animate-bounce" />
              <p className="text-xs text-[#2d5a37] font-bold">Your puppy coach is fetching insights...</p>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <p className="text-xs text-muted-foreground animate-pulse">Your coach is analyzing your history...</p>
            </>
          )}
        </div>
      );
    }

    if (!coachReport || !coachReport.unlocked || !coachReport.report) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-base font-black text-foreground tracking-tight flex items-center gap-1.5">
              {isCute ? "Your AI Coach 🐾" : "AI Coach"}
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Long-term practice analysis, readiness indicators, and targeted improvement pathways.
            </p>
          </div>
          <Card className={`overflow-hidden border-border/85 bg-card max-w-xl mx-auto mt-8 ${isCute ? "border-[rgba(21,46,27,0.14)] bg-white/40" : ""}`}>
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              {isCute ? (
                <img src="/cute_garden_puppy.png" alt="Puppy Coach" className="w-32 h-32 object-contain animate-float-leaf" style={{ "--duration": "8s" } as any} />
              ) : (
                <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="M14.83 9.17a4 4 0 0 0-5.66 5.66"/><path d="m14.83 9.17 4.24-4.24"/><path d="m9.17 14.83-4.24 4.24"/><path d="m14.83 14.83 4.24 4.24"/></svg>
                </div>
              )}
              <h3 className="text-sm font-black text-foreground">{isCute ? "AI Coach is Napping!" : "AI Coach is Locked"}</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Complete at least one Public Speaking speech or Mock Interview session to unlock your AI Coach. 
                Your coach needs practice history to analyze your strengths, weaknesses, growth trends, and recommend targeted preparation.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    const report = coachReport.report;

    const handleArticleClick = async (articleId: string) => {
      let art = libraryArticles.find(a => a.id === articleId);
      if (!art) {
        if (!session) return;
        try {
          const res = await fetch(`${getApiBaseUrl()}/api/knowledge/articles`, {
            headers: { Authorization: `Bearer ${session.access_token}` }
          });
          if (res.ok) {
            const list = await res.json();
            setLibraryArticles(list);
            art = list.find((a: any) => a.id === articleId);
          }
        } catch (e) {
          console.error("Failed to fetch articles", e);
        }
      }
      if (art) {
        setSelectedArticle(art);
      }
    };

    return (
      <div className="space-y-6 animate-bloom">
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-base font-black text-foreground tracking-tight flex items-center gap-1.5">
            {isCute ? "Your AI Coach 🐾" : "AI Coach"}
          </h2>
          <p className="text-[10px] text-muted-foreground">
            Long-term practice analysis, readiness indicators, and targeted improvement pathways.
          </p>
        </div>

        {/* Readiness Indicator */}
        <Card className={`overflow-hidden ${isCute ? "border-[rgba(21,46,27,0.14)] bg-white/40" : "border-border/85 bg-card"}`}>
          <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Interview Readiness</span>
                <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full border ${
                  report.readiness_level?.toLowerCase() === "high" 
                    ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30" 
                    : report.readiness_level?.toLowerCase() === "medium" 
                      ? "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30" 
                      : "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30"
                }`}>
                  {report.readiness_level}
                </span>
              </div>
              <h3 className="text-sm font-black text-foreground">{isCute ? "Current Status 🌸" : "Current Assessment"}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {report.readiness_description}
              </p>
              {report.recommended_focus && (
                <p className="text-[11px] text-foreground font-semibold flex items-center gap-1.5 mt-2">
                  <span className="text-primary">✦</span> Recommended Focus: <span className="text-muted-foreground font-medium">{report.recommended_focus}</span>
                </p>
              )}
            </div>
            <div className="shrink-0 flex items-center gap-4">
              {isCute ? (
                <img src="/cute_garden_puppy.png" alt="Coach Puppy" className="w-20 h-20 object-contain animate-float-leaf" style={{ "--duration": "9s" } as any} />
              ) : (
                <div className="h-16 w-16 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/25 relative">
                  <span className="text-sm font-black text-indigo-700 dark:text-indigo-400">{report.readiness_level}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skill Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={`p-4 shadow-sm flex flex-col justify-between h-20 ${isCute ? "border-[rgba(21,46,27,0.14)] bg-white/40" : "border-border/85 bg-card"}`}>
            <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Strongest Skill</p>
              <p className="text-xs font-black text-foreground mt-1">{report.strongest_skill || "Not Analyzed"}</p>
            </div>
            <div className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Peak Area
            </div>
          </Card>
          <Card className={`p-4 shadow-sm flex flex-col justify-between h-20 ${isCute ? "border-[rgba(21,46,27,0.14)] bg-white/40" : "border-border/85 bg-card"}`}>
            <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Weakest Skill</p>
              <p className="text-xs font-black text-rose-600 mt-1">{report.weakest_skill || "Not Analyzed"}</p>
            </div>
            <div className="text-[9px] text-rose-500 font-extrabold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Focus Target
            </div>
          </Card>
          <Card className={`p-4 shadow-sm flex flex-col justify-between h-20 ${isCute ? "border-[rgba(21,46,27,0.14)] bg-white/40" : "border-border/85 bg-card"}`}>
            <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Most Improved</p>
              <p className="text-xs font-black text-emerald-600 mt-1">{report.most_improved_skill || "Not Analyzed"}</p>
            </div>
            <div className="text-[9px] text-indigo-500 font-extrabold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Upward Trend
            </div>
          </Card>
        </div>

        {/* Growth Trends & Strengths/Weaknesses Panels */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Growth Trends Panel */}
          <Card className={`md:col-span-5 p-4 flex flex-col justify-between ${isCute ? "border-[rgba(21,46,27,0.14)] bg-white/40" : "border-border/85 bg-card"}`}>
            <div>
              <CardTitle className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${isCute ? "text-[#2d5a37]" : "text-muted-foreground"}`}>
                Growth Trends
              </CardTitle>
              <div className="space-y-4">
                {report.trend_metrics && report.trend_metrics.length > 0 ? (
                  report.trend_metrics.map((m: any) => {
                    const positive = m.change_percentage >= 0;
                    return (
                      <div key={m.skill} className="space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-semibold text-foreground/90">{m.skill}</span>
                          <span className={`font-black flex items-center ${positive ? "text-emerald-600" : "text-rose-600"}`}>
                            {positive ? (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mr-0.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                            ) : (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mr-0.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                            )}
                            {positive ? `+${m.change_percentage}%` : `${m.change_percentage}%`}
                          </span>
                        </div>
                        {/* Custom progress/trend bar */}
                        <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${positive ? "bg-emerald-500" : "bg-rose-400"}`} 
                            style={{ width: `${Math.max(5, Math.min(100, Math.abs(m.change_percentage) * 3))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[10px] text-muted-foreground">No trend metrics generated yet.</p>
                )}
              </div>
            </div>
          </Card>

          {/* Strengths & Weaknesses Panel */}
          <Card className={`md:col-span-7 p-4 flex flex-col justify-between ${isCute ? "border-[rgba(21,46,27,0.14)] bg-white/40" : "border-border/85 bg-card"}`}>
            <div>
              <CardTitle className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${isCute ? "text-[#2d5a37]" : "text-muted-foreground"}`}>
                Skill Breakdown
              </CardTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Strengths list */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-1 inline-block">
                    Key Strengths
                  </h4>
                  <ul className="space-y-1.5">
                    {report.strengths && report.strengths.length > 0 ? (
                      report.strengths.map((str: string, i: number) => (
                        <li key={i} className="text-[10px] leading-relaxed text-foreground/80 flex items-start">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-500 mr-1.5 mt-0.5 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                          <span>{str}</span>
                        </li>
                      ))
                    ) : (
                      <p className="text-[10px] text-muted-foreground">No strengths recorded.</p>
                    )}
                  </ul>
                </div>

                {/* Weaknesses list */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-100 rounded px-2 py-1 inline-block">
                    Focus Areas
                  </h4>
                  <ul className="space-y-1.5">
                    {report.weaknesses && report.weaknesses.length > 0 ? (
                      report.weaknesses.map((wk: string, i: number) => (
                        <li key={i} className="text-[10px] leading-relaxed text-foreground/80 flex items-start">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-rose-400 mr-1.5 mt-0.5 shrink-0"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          <span>{wk}</span>
                        </li>
                      ))
                    ) : (
                      <p className="text-[10px] text-muted-foreground">No weaknesses recorded.</p>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recommendations & Pathways */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Recommended Tracks */}
          <Card className={`p-4 ${isCute ? "border-[rgba(21,46,27,0.14)] bg-white/40" : "border-border/85 bg-card"}`}>
            <CardTitle className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${isCute ? "text-[#2d5a37]" : "text-muted-foreground"}`}>
              Recommended Tracks
            </CardTitle>
            <div className="space-y-2">
              {report.recommended_tracks && report.recommended_tracks.length > 0 ? (
                report.recommended_tracks.map((trackKey: string) => {
                  const trackMeta = TRACKS_METADATA[trackKey];
                  if (!trackMeta) return null;
                  return (
                    <div 
                      key={trackKey}
                      onClick={() => {
                        setModuleType("interview_preparation");
                        setActiveTab("tracks");
                        setActiveTrack(trackKey);
                      }}
                      className={`p-3 rounded-lg border border-border/50 hover:border-primary/50 bg-card/50 hover:bg-card transition-all cursor-pointer flex items-center justify-between group`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{trackMeta.icon}</span>
                        <div>
                          <h4 className="text-[11px] font-bold text-foreground group-hover:text-primary transition-colors">
                            {trackMeta.label}
                          </h4>
                          <p className="text-[9px] text-muted-foreground line-clamp-1">{trackMeta.desc}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Start Practice →
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-[10px] text-muted-foreground">No specific tracks recommended currently.</p>
              )}
            </div>
          </Card>

          {/* Recommended Readings */}
          <Card className={`p-4 ${isCute ? "border-[rgba(21,46,27,0.14)] bg-white/40" : "border-border/85 bg-card"}`}>
            <CardTitle className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${isCute ? "text-[#2d5a37]" : "text-muted-foreground"}`}>
              Recommended Readings
            </CardTitle>
            <div className="space-y-2">
              {report.recommended_articles && report.recommended_articles.length > 0 ? (
                report.recommended_articles.map((rec: any) => (
                  <div 
                    key={rec.article_id}
                    onClick={() => handleArticleClick(rec.article_id)}
                    className={`p-3 rounded-lg border border-border/50 hover:border-primary/50 bg-card/50 hover:bg-card transition-all cursor-pointer flex flex-col justify-between group`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-[11px] font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-1">
                        {rec.title}
                      </h4>
                      <span className="px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded bg-muted text-muted-foreground tracking-wider select-none shrink-0">
                        {rec.category}
                      </span>
                    </div>
                    <p className="text-[9px] text-muted-foreground/80 mt-1 italic line-clamp-1">
                      Why: {rec.reason}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-muted-foreground">No specific articles recommended currently.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className={`${themeRoot} ${normalTheme !== "light" ? "dark" : ""} h-screen flex flex-col overflow-hidden bg-background font-sans relative`}>

      {/* ── Cute Theme Animated Background ────────────────────────────────── */}
      {isCute && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-tr from-[#fffdf9] via-[#fef3e9] to-[#ffe4e6]">
          {/* Layer 1: Soft light spots (blobs) */}
          <div className="absolute top-[8%] left-[15%] w-[400px] h-[400px] rounded-full bg-[#fef9c3]/20 blur-[120px] animate-blob" />
          <div className="absolute bottom-[15%] right-[10%] w-[450px] h-[450px] rounded-full bg-[#fbcfe8]/18 blur-[130px] animate-blob animation-delay-2000" />
          <div className="absolute top-[45%] right-[25%] w-[350px] h-[350px] rounded-full bg-[#ffd8a8]/15 blur-[100px] animate-blob animation-delay-4000" />

          {/* Layer 2: Rolling grassy hill outlines and distant flower silhouettes */}
          <svg className="absolute bottom-0 left-0 w-full h-[22vh] text-[#fef3e9]/85 select-none" viewBox="0 0 1440 200" fill="currentColor" preserveAspectRatio="none">
            <path d="M0,130 C300,165 450,90 750,150 C1050,210 1200,110 1440,130 L1440,200 L0,200 Z" />
          </svg>
          <svg className="absolute bottom-0 left-0 w-full h-[18vh] text-[#ffd8a8]/30 select-none" viewBox="0 0 1440 200" fill="currentColor" preserveAspectRatio="none">
            <path d="M0,140 C280,110 520,180 850,130 C1180,80 1300,160 1440,140 L1440,200 L0,200 Z" />
          </svg>

          {/* Swaying distant daffodil stems (Highly blurred Layer 2 silhouettes) */}
          <svg className="absolute bottom-[2%] left-[10%] w-16 h-[38vh] text-[#fbbf24]/10 select-none blur-[4px] animate-float-leaf" style={{ "--duration": "16s", "--delay": "0s" } as any} viewBox="0 0 100 300" fill="currentColor">
            <path d="M50,300 Q40,140 50,40" stroke="currentColor" strokeWidth="3" fill="none" />
            <circle cx="50" cy="40" r="10" />
            <path d="M50,40 Q35,32 30,20 Q42,24 50,40 M50,40 Q65,32 70,20 Q58,24 50,40 M50,40 Q42,56 30,60 Q35,48 50,40 M50,40 Q58,56 70,60 Q65,48 50,40" />
          </svg>
          <svg className="absolute bottom-[1%] right-[18%] w-20 h-[42vh] text-[#fbbf24]/08 select-none blur-[5px] animate-float-leaf" style={{ "--duration": "20s", "--delay": "2s" } as any} viewBox="0 0 100 300" fill="currentColor">
            <path d="M50,300 Q60,160 50,50" stroke="currentColor" strokeWidth="3.5" fill="none" />
            <circle cx="50" cy="50" r="12" />
            <path d="M50,50 Q32,40 26,26 Q40,30 50,50 M50,50 Q68,40 74,26 Q60,30 50,50 M50,50 Q40,68 26,74 Q32,60 50,50 M50,50 Q68,68 74,74 Q60,60 50,50" />
          </svg>

          {/* Large soft daffodil illustration in Layer 2 */}
          <img src="/daffodil_bouquet.png" alt="" className="absolute top-[4%] left-[-6%] w-[420px] h-[420px] object-contain opacity-[0.035] select-none filter blur-[3px] hover:scale-105 transition-transform duration-1000" />

          {/* Layer 3: Floating daffodil petals, drifting leaves, and paw print trails */}
          <div className="absolute inset-0 z-0">
            {/* Drifting Leaf 1 */}
            <svg className="absolute w-5 h-5 text-[#568764]/20 animate-float-leaf top-[15%] left-[25%]" style={{ "--duration": "14s", "--delay": "0s" } as any} viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 2c-5.5 0-10 4.5-10 10 0 1.2.2 2.3.6 3.4L2 22l6.6-.6c1.1.4 2.2.6 3.4.6 5.5 0 10-4.5 10-10V2h-1z" />
            </svg>
            {/* Drifting Leaf 2 */}
            <svg className="absolute w-6 h-6 text-[#2d5a37]/15 animate-float-leaf top-[55%] left-[45%]" style={{ "--duration": "18s", "--delay": "4s" } as any} viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 2c-5.5 0-10 4.5-10 10 0 1.2.2 2.3.6 3.4L2 22l6.6-.6c1.1.4 2.2.6 3.4.6 5.5 0 10-4.5 10-10V2h-1z" />
            </svg>
            {/* Drifting Leaf 3 */}
            <svg className="absolute w-4.5 h-4.5 text-[#854d0e]/15 animate-float-leaf top-[75%] left-[82%]" style={{ "--duration": "16s", "--delay": "2s" } as any} viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 2c-5.5 0-10 4.5-10 10 0 1.2.2 2.3.6 3.4L2 22l6.6-.6c1.1.4 2.2.6 3.4.6 5.5 0 10-4.5 10-10V2h-1z" />
            </svg>

            {/* Drifting Daffodil Petal 1 */}
            <svg className="absolute w-4 h-4 text-[#eab308]/25 animate-float-flower top-[30%] left-[80%]" style={{ "--duration": "15s", "--delay": "1s" } as any} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C9.5 5 9.5 9.5 12 12c2.5-2.5 2.5-7 0-10z" />
            </svg>
            {/* Drifting Daffodil Petal 2 */}
            <svg className="absolute w-3.5 h-3.5 text-[#fbbf24]/20 animate-float-flower top-[70%] left-[15%]" style={{ "--duration": "12s", "--delay": "5s" } as any} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C9.5 5 9.5 9.5 12 12c2.5-2.5 2.5-7 0-10z" />
            </svg>
            {/* Drifting Daffodil Petal 3 */}
            <svg className="absolute w-4.5 h-4.5 text-[#fef08a]/30 animate-float-flower top-[45%] left-[55%]" style={{ "--duration": "22s", "--delay": "3s" } as any} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C9.5 5 9.5 9.5 12 12c2.5-2.5 2.5-7 0-10z" />
            </svg>

            {/* Paw Print Trail 1 */}
            <div className="absolute top-[28%] left-[32%] opacity-15 flex gap-4 rotate-12 select-none">
              <svg className="w-4.5 h-4.5 text-[#568764]/40 animate-pulse" style={{ animationDelay: '0s', animationDuration: '3.5s' }} viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="8" r="2" /><circle cx="12" cy="5" r="2" /><circle cx="16" cy="8" r="2" /><circle cx="12" cy="14" r="4" /></svg>
              <svg className="w-4.5 h-4.5 text-[#568764]/40 animate-pulse mt-1.5" style={{ animationDelay: '0.7s', animationDuration: '3.5s' }} viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="8" r="2" /><circle cx="12" cy="5" r="2" /><circle cx="16" cy="8" r="2" /><circle cx="12" cy="14" r="4" /></svg>
              <svg className="w-4.5 h-4.5 text-[#568764]/40 animate-pulse mt-0.5" style={{ animationDelay: '1.4s', animationDuration: '3.5s' }} viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="8" r="2" /><circle cx="12" cy="5" r="2" /><circle cx="16" cy="8" r="2" /><circle cx="12" cy="14" r="4" /></svg>
            </div>

            {/* Paw Print Trail 2 */}
            <div className="absolute bottom-[24%] right-[22%] opacity-15 flex gap-4 -rotate-12 select-none">
              <svg className="w-4.5 h-4.5 text-[#854d0e]/30 animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }} viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="8" r="2" /><circle cx="12" cy="5" r="2" /><circle cx="16" cy="8" r="2" /><circle cx="12" cy="14" r="4" /></svg>
              <svg className="w-4.5 h-4.5 text-[#854d0e]/30 animate-pulse mt-1.5" style={{ animationDelay: '2.8s', animationDuration: '4s' }} viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="8" r="2" /><circle cx="12" cy="5" r="2" /><circle cx="16" cy="8" r="2" /><circle cx="12" cy="14" r="4" /></svg>
            </div>
          </div>
        </div>
      )}

      {/* ── Drawer backdrop ───────────────────────────────────────────────── */}
      {showDrawer && <div className="fixed inset-0 z-40 bg-black/20" onClick={()=>setShowDrawer(false)}/>}

      {/* ── Practice Drawer ───────────────────────────────────────────────── */}
      <div className={`fixed right-0 top-0 h-full z-50 flex flex-col shadow-2xl transition-all duration-300 overflow-hidden
        ${isCute 
          ? "bg-[#f4fbf7]/40 border-l border-[rgba(86,135,100,0.2)] backdrop-blur-xl" 
          : "bg-card border-l border-border"
        }`}
        style={{
          width: "min(460px, 100vw)",
          maxWidth: "100vw",
          transform: showDrawer ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.32,0.72,0,1), background-color 0.3s, border-color 0.3s"
        }}
      >
        {/* Living Garden Backdrop for Drawer */}
        {isCute && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Soft backdrop gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#fffdf9]/40 via-[#fef3e9]/55 to-[#ffe4e6]/40" />
            {/* Slow moving garden blobs */}
            <div className="absolute top-[15%] right-[-50px] w-[200px] h-[200px] rounded-full bg-[#fef9c3]/15 blur-[60px] animate-blob" />
            <div className="absolute bottom-[20%] left-[-50px] w-[220px] h-[220px] rounded-full bg-[#fbcfe8]/15 blur-[70px] animate-blob animation-delay-2000" />
            
            {/* Drifting leaves and flower petals in the drawer */}
            <div className="absolute inset-0 z-0">
              {/* Petal 1 */}
              <svg className="absolute w-4 h-4 text-[#eab308]/25 animate-float-flower top-[15%] left-[20%]" style={{ "--duration": "12s", "--delay": "1s" } as any} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C9.5 5 9.5 9.5 12 12c2.5-2.5 2.5-7 0-10z" />
              </svg>
              {/* Petal 2 */}
              <svg className="absolute w-3.5 h-3.5 text-[#fbbf24]/20 animate-float-flower top-[60%] left-[80%]" style={{ "--duration": "16s", "--delay": "3s" } as any} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C9.5 5 9.5 9.5 12 12c2.5-2.5 2.5-7 0-10z" />
              </svg>
              {/* Leaf 1 */}
              <svg className="absolute w-4.5 h-4.5 text-[#568764]/20 animate-float-leaf top-[40%] left-[65%]" style={{ "--duration": "14s", "--delay": "0s" } as any} viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 2c-5.5 0-10 4.5-10 10 0 1.2.2 2.3.6 3.4L2 22l6.6-.6c1.1.4 2.2.6 3.4.6 5.5 0 10-4.5 10-10V2h-1z" />
              </svg>
              {/* Leaf 2 */}
              <svg className="absolute w-4 h-4 text-[#854d0e]/15 animate-float-leaf top-[75%] left-[30%]" style={{ "--duration": "18s", "--delay": "5s" } as any} viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 2c-5.5 0-10 4.5-10 10 0 1.2.2 2.3.6 3.4L2 22l6.6-.6c1.1.4 2.2.6 3.4.6 5.5 0 10-4.5 10-10V2h-1z" />
              </svg>
              
              {/* If recording, render extra leaves with faster drift rates for "garden becomes slightly more active" */}
              {recordingState === "recording" && (
                <>
                  <svg className="absolute w-4 h-4 text-[#eab308]/45 animate-float-flower top-[25%] left-[75%]" style={{ "--duration": "6s", "--delay": "0.2s" } as any} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C9.5 5 9.5 9.5 12 12c2.5-2.5 2.5-7 0-10z" />
                  </svg>
                  <svg className="absolute w-4.5 h-4.5 text-[#568764]/40 animate-float-leaf top-[55%] left-[25%]" style={{ "--duration": "7s", "--delay": "0.4s" } as any} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 2c-5.5 0-10 4.5-10 10 0 1.2.2 2.3.6 3.4L2 22l6.6-.6c1.1.4 2.2.6 3.4.6 5.5 0 10-4.5 10-10V2h-1z" />
                  </svg>
                </>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b flex-shrink-0 z-10 bg-transparent
          ${isCute ? "border-[rgba(86,135,100,0.2)]" : "border-border"}`}
        >
          <div>
            <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
              Practice Terminal
              {isCute && <span className="text-xs animate-spin" style={{ animationDuration: '6s' }}>🌼</span>}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Generate a topic, then record your response</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/80 hover:text-foreground" onClick={()=>setShowDrawer(false)}><Ic.X/></Button>
        </div>

        {/* Body */}
        <div ref={drawerBodyRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 z-10 bg-transparent">

          {/* Topic generator */}
          <Card>
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Topic Generator</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <form onSubmit={handleGenerateTopic} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="custom-topic" className="text-xs">Custom topic (optional)</Label>
                  <Input id="custom-topic" value={customTopic} onChange={e=>setCustomTopic(e.target.value)}
                    placeholder="e.g. benefits of remote work, my leadership story..." className="text-sm h-9"/>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Module</Label>
                  <Select value={moduleType} onValueChange={v=>v&&setModuleType(v as any)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue>{moduleType === "public_speaking" ? "Public Speaking" : "Interview Prep"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public_speaking">Public Speaking</SelectItem>
                      <SelectItem value="interview_preparation">Interview Preparation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {moduleType === "public_speaking" ? (
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Category</Label>
                      <Select value={category} onValueChange={v=>v&&setCategory(v)}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue>{category === "impromptu" ? "Impromptu" : category === "interview" ? "Job Interview" : category === "persuasive" ? "Persuasive" : category === "warmup" ? "Warmup" : category === "debate" ? "Debate" : category}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="impromptu">Impromptu</SelectItem>
                          <SelectItem value="interview">Job Interview</SelectItem>
                          <SelectItem value="persuasive">Persuasive</SelectItem>
                          <SelectItem value="warmup">Warmup</SelectItem>
                          <SelectItem value="debate">Debate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Interview Type</Label>
                      <Select value={interviewType} onValueChange={v=>v&&setInterviewType(v)}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue>{INTERVIEW_TYPES.find(t=>t.value===interviewType)?.label||interviewType}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {INTERVIEW_TYPES.map(t=> (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Difficulty</Label>
                    <Select value={difficulty} onValueChange={v=>v&&setDifficulty(v)}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue>{difficulty === "easy" ? "Easy" : difficulty === "medium" ? "Medium" : difficulty === "hard" ? "Hard" : difficulty}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {moduleType === "interview_preparation" && (
                    <div className="col-span-2 flex flex-col gap-1.5">
                      <Label className="text-xs">Interview Style</Label>
                      <Select value={interviewPersona} onValueChange={v=>v&&setInterviewPersona(v)}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue>{INTERVIEW_PERSONAS.find(p=>p.value===interviewPersona)?.label||interviewPersona}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {INTERVIEW_PERSONAS.map(p=> (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={topicLoading} className="w-full" style={primaryBtnStyle}>
                  {topicLoading ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2"/>Generating...</> : "Generate Topic"}
                </Button>
                {topicError && <p className="text-xs text-destructive font-medium">{topicError}</p>}
              </form>
            </CardContent>
          </Card>

          {/* Generated topic */}
          {activeTopic && (
            <Card className={`border ${accentBorderClass} ${accentBgClass} relative overflow-visible`}>
              <CardContent className="p-4 flex gap-4 justify-between items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <p className={`font-bold text-sm leading-snug ${accentTextClass}`}>{activeTopic.title}</p>
                    <Badge variant="secondary" className="text-[10px] uppercase shrink-0 bg-muted text-muted-foreground border border-border">{difficulty}</Badge>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-3">{activeTopic.prompt}</p>
                  {activeTopic.module_type === "interview_preparation" ? (
                    <div className="space-y-3">
                      {activeTopic.context && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Scenario/Context</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{activeTopic.context}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Evaluation Focus</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          The interviewer is evaluating your <strong>Confidence</strong>, <strong>Professionalism</strong>, <strong>Readiness</strong>, <strong>Structure</strong>, and <strong>Relevance</strong>.
                        </p>
                      </div>
                      {activeTopic.suggested_points?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Suggested Answer Structure</p>
                          <ul className="space-y-1.5">
                            {activeTopic.suggested_points.map((p, i) => (
                              <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                                <span className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white mt-0.5 bg-[var(--accent-color)]">{i+1}</span>
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    activeTopic.suggested_points?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Talking Points</p>
                        <ul className="space-y-1.5">
                          {activeTopic.suggested_points.map((p, i) => (
                            <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                              <span className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white mt-0.5 bg-[var(--accent-color)]">{i+1}</span>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
                {isCute && (
                  <div className="relative w-24 h-24 shrink-0 select-none pointer-events-none mt-2 self-end">
                    <div className="absolute -bottom-1 -left-2 text-[10px] animate-pulse">🌸 🌼 🌸</div>
                    <img src="/cute_garden_puppy.png" alt="Peeking Puppy" className="w-24 h-24 object-contain animate-float-leaf" style={{ "--duration": "8s" } as any} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recorder */}
          {activeTopic && (
            <Card className={`transition-all duration-500
              ${isCute && recordingState === "recording"
                ? "animate-pulse-glow"
                : ""
              }`}
            >
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Record Your Response</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 flex flex-col gap-4">
                {/* Timer */}
                <div className="text-center">
                  <p className="text-5xl font-black tracking-tighter tabular-nums text-foreground" style={{fontFamily:"'SF Mono',monospace"}}>{ft(recordSeconds)}</p>
                  {recordingState==="recording"&&<div className="flex items-center justify-center gap-1.5 mt-2"><span className="rec-pulse w-2 h-2 rounded-full bg-red-500"/><span className="text-[10px] font-bold tracking-widest text-red-500">REC</span></div>}
                  {recordingState==="paused"&&<p className="text-[10px] font-bold tracking-widest text-muted-foreground mt-2">PAUSED</p>}
                </div>

                {/* Waveform */}
                {recordingState==="recording"&&(
                  <div className="h-9 flex items-center justify-center gap-[2px] overflow-hidden">
                    {Array.from({length:32}).map((_,i)=>{
                      const hs=[8,14,20,10,24,16,12,28,18,10,22,16,8,20,14,26,12,18,10,24,16,8,20,14,28,12,18,10,22,16,8,20];
                      return <div key={i} className={`w-[3px] rounded-sm 
                        ${isCute 
                          ? (i % 2 === 0 ? "bg-[#eab308]" : "bg-[#568764]") 
                          : "bg-indigo-500"
                        }`} 
                        style={{height:`${hs[i%hs.length]}px`,animation:`recPulse ${0.8+i*0.04}s ease-in-out infinite`,animationDelay:`${i*0.03}s`}}/>;
                    })}
                  </div>
                )}

                {/* Controls */}
                {recordingState==="idle"&&(
                  <Button onClick={startRecording} className="w-full gap-2" style={primaryBtnStyle}><Ic.Mic/>Start Recording</Button>
                )}
                {recordingState==="recording"&&(
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={pauseRecording} className="flex-1">Pause</Button>
                    <Button variant="destructive" onClick={()=>stopStream()} className="flex-1">Stop</Button>
                  </div>
                )}
                {recordingState==="paused"&&(
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resumeRecording} className={`flex-1 ${accentBorderClass} ${accentTextClass}`}>Resume</Button>
                    <Button variant="destructive" onClick={()=>stopStream()} className="flex-1">Stop</Button>
                  </div>
                )}
                {recordingState==="stopped"&&(
                  <div className="flex flex-col gap-3">
                    <div className="rounded-lg border border-border bg-muted/40 p-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span className="font-medium text-foreground">Duration: {ft(recordSeconds)}</span>
                        {audioBlob&&<span>{(audioBlob.size/1048576).toFixed(2)} MB</span>}
                      </div>
                      <audio src={audioUrl||""} controls className="w-full h-8 rounded"/>
                    </div>
                    {recordSeconds<10&&<p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 font-medium">Speech must be at least 10 seconds long.</p>}
                    {uploadError&&<p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 font-medium">{uploadError}</p>}
                    <div className="flex gap-2">
                      <Button onClick={handleSubmitSpeech} disabled={isUploading||recordSeconds<10} className="flex-1" style={primaryBtnStyle}>
                        {isUploading?<><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2"/>Uploading...</>:"Submit for Evaluation"}
                      </Button>
                      <Button variant="outline" onClick={discardRecording} disabled={isUploading}>Discard</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Dashboard Layout ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden z-10 w-full h-full">

        {/* ── LEFT SIDEBAR (DESKTOP) ─────────────────────────────────────── */}
        <aside className="hidden md:flex w-[260px] shrink-0 border-r border-[var(--border-sidebar)] bg-[var(--bg-sidebar)] flex-col overflow-hidden backdrop-blur-md">
          {/* Logo Area */}
          <div className="p-4 border-b border-[var(--border-sidebar)]/60 flex items-center justify-between flex-shrink-0 bg-transparent">
            <div className="flex items-center gap-2 select-none">
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-white font-black text-xs shadow-md" style={{ background: 'var(--logo-gradient)' }}>
                S
              </div>
              <span className="font-black text-sm tracking-tight shrink-0 bg-clip-text text-transparent" style={{backgroundImage: "var(--logo-gradient)"}}>
                SpeakAI Coach
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-3 border-b border-[var(--border-sidebar)]/60 flex-shrink-0 space-y-1">
            {[
              { id: "console", label: "Practice Console", icon: <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"/></svg> },
              { id: "tracks", label: "Interview Tracks", icon: <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>, onSelect: () => { setModuleType("interview_preparation"); fetchTrackStats(); } },
              { id: "library", label: "Knowledge Library", icon: <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/></svg> },
              { id: "coach", label: "AI Coach", icon: <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.625.625 0 1 1-1.25 0 .625.625 0 0 1 1.25 0Zm4.5 0a.625.625 0 1 1-1.25 0 .625.625 0 0 1 1.25 0Zm4.5 0a.625.625 0 1 1-1.25 0 .625.625 0 0 1 1.25 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.046.218.07.444.07.675 0 2.761-2.91 5-6.5 5-1.127 0-2.189-.221-3.084-.607L6.5 15.5v-3.791c-1.879-1.047-3.001-2.617-3.001-4.384 0-3.314 3.582-6 8-6 4.418 0 8 2.686 8 6Z"/></svg> }
            ].map(tab => {
              const active = !uploadSuccess && activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setUploadSuccess(false);
                    setPolledSpeechId(null);
                    setPolledSpeechDetails(null);
                    if (tab.onSelect) tab.onSelect();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    active
                      ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]"
                      : "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-hover)]"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* History Header */}
          <div className="p-3 pb-1.5 flex justify-between items-center flex-shrink-0 bg-transparent">
            <span className="font-bold text-[10px] uppercase tracking-wider text-[var(--sidebar-subtext)]">Practice History</span>
            <span className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full bg-[var(--sidebar-active-bg)] border border-[var(--border-sidebar)] text-[var(--sidebar-active-text)]">
              {historyList.length} {historyList.length === 1 ? "session" : "sessions"}
            </span>
          </div>

          {/* Search Filters */}
          <div className="px-3 py-2 flex gap-1 border-b border-[var(--border-sidebar)] shrink-0 overflow-x-auto select-none bg-muted/10">
            {[
              { id: "all", label: "All" },
              { id: "speaking", label: "Speaking" },
              { id: "interview", label: "Interview" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setHistoryFilter(f.id as any)}
                className={`text-[11px] font-bold px-2 py-1 rounded-md transition-all whitespace-nowrap ${
                  historyFilter === f.id
                    ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] shadow-sm"
                    : "text-[var(--sidebar-subtext)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-hover)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isCute && <div className="px-3 pt-2 shrink-0">{renderLeafDivider()}</div>}

          {/* History Scroll List */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-1">
            <div className="p-3 space-y-4">
              {historyError&&<p className="text-xs text-destructive p-2">{historyError}</p>}
              {!historyLoading&&historyList.length===0&&(
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  {isCute ? (
                    <div className="flex flex-col items-center gap-2 animate-bloom relative">
                      <span className="text-xs absolute -top-1 -left-3 animate-float-leaf">🌼</span>
                      <span className="text-xs absolute -bottom-1 -right-3 animate-float-leaf" style={{ animationDelay: '1.2s' }}>🌼</span>
                      <div className="relative w-16 h-16 opacity-95 select-none pointer-events-none flex items-center justify-center">
                        <span className="text-3xl animate-float-leaf">💤</span>
                      </div>
                      <p className="text-[10px] font-extrabold text-[#2d5a37] mt-1">The garden is resting...</p>
                      <p className="text-[11px] text-[#2d5a37]/75 max-w-[180px] leading-relaxed">Practice to plant your first seed!</p>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--sidebar-subtext)] text-center py-12 px-4">No sessions yet. Start practicing.</p>
                  )}
                </div>
              )}
              {getGroupedHistory().map(group => (
                <div key={group.label} className="space-y-1.5">
                  <p className="text-[10px] font-extrabold tracking-widest text-muted-foreground/80 dark:text-zinc-400 uppercase px-2 pt-2 pb-0.5">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const sel = polledSpeechId === item.id;
                      const score = item.overall_score;
                      let dotClass = isCute ? "bg-amber-400 ring-1 ring-background" : "bg-[#899878]/80 ring-1 ring-background";
                      if (item.status === "failed") {
                        dotClass = "bg-red-500 ring-1 ring-background";
                      } else if (item.status !== "completed") {
                        dotClass = "bg-[#D0D2F1] ring-1 ring-background animate-pulse";
                      }
                      const activeClass = sel 
                      ? "bg-[var(--sidebar-active-bg)] border-l-2 border-l-[var(--sidebar-active-border)]" 
                      : "border-l-2 border-l-transparent hover:bg-[var(--sidebar-hover-bg)]";

                      return (
                        <button key={item.id}
                          onClick={()=>{
                            if (pollingRef.current) {
                              clearInterval(pollingRef.current);
                              pollingRef.current = null;
                            }
                            setPolledSpeechId(item.id);
                            fetchCompletedSessionDetails(item.id);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-md transition-all flex flex-col gap-1 ${activeClass}`}
                          style={{fontFamily:"inherit"}}>
                          <div className="flex items-center justify-between gap-2 w-full min-w-0">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} title={item.status}/>
                              {item.is_session ? (
                                <span className={`text-[11px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] shrink-0 truncate max-w-[140px] ${sel ? "text-[var(--sidebar-active-text)]" : ""}`}>
                                  {item.topics?.title || "Interview"}
                                </span>
                              ) : (
                                <span className={`text-xs font-semibold truncate transition-colors ${sel ? "text-[var(--sidebar-active-text)]" : "text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-hover)]"}`}>
                                  {item.topics?.title || "Impromptu Speech"}
                                </span>
                              )}
                            </div>
                            {score !== null && (
                              <span className={`text-xs font-bold shrink-0 tabular-nums ${sel ? "text-[var(--sidebar-active-text)]" : "text-[var(--sidebar-text)]"}`}>
                                {score}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/75 dark:text-zinc-400/90 pl-3.5">
                            <span>{fd(item.duration_seconds)}</span>
                            <span>•</span>
                            <span>{fTime(item.created_at)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isCute && (
            <div className="p-3 border-t border-[var(--border-sidebar)] bg-transparent flex-shrink-0">
              <div className="rounded-2xl border border-[rgba(236,72,153,0.18)] bg-white/45 backdrop-blur-md p-3 relative flex items-center gap-3 overflow-hidden shadow-sm hover:border-[rgba(236,72,153,0.35)] transition-all">
                <div className="absolute top-0 right-0 w-12 h-12 bg-pink-100/30 rounded-bl-full pointer-events-none" />
                <img src="/cute_sleeping_puppy.png" alt="Sleeping Puppy" className="w-14 h-14 object-contain shrink-0 animate-bounce" style={{ animationDuration: '6s' }} />
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold text-[var(--accent-text)]">Garden Companion</p>
                  <p className="text-[9px] text-[var(--sidebar-subtext)] mt-0.5 leading-normal">
                    {stats?.current_streak ? `You've practiced ${stats.current_streak} days in a row!` : "Cozying up... ready to practice today!"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sidebar Ad Placement */}
          <div className="px-3 flex-shrink-0">
            <AdBanner placement="sidebar" hidden={shouldHideAds} />
          </div>

          {/* History Pagination */}
          <div className="flex-shrink-0 px-3 py-2 border-t border-[var(--border-sidebar)] flex justify-between items-center bg-transparent">
            <Button variant="ghost" size="xs" className="text-[10px] h-6 font-semibold text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-hover)] hover:bg-[var(--sidebar-hover-bg)]" onClick={()=>fetchHistory(historyPage-1)} disabled={historyPage===1||historyLoading}>Prev</Button>
            <span className="text-[10px] font-medium text-[var(--sidebar-subtext)]">Page {historyPage}</span>
            <Button variant="ghost" size="xs" className="text-[10px] h-6 font-semibold text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-hover)] hover:bg-[var(--sidebar-hover-bg)]" onClick={()=>fetchHistory(historyPage+1)} disabled={!hasMoreHistory||historyLoading}>Next</Button>
          </div>

          {/* Left Sidebar Bottom Zone (Theme & Logout) */}
          <div className="p-3 border-t border-[var(--border-sidebar)] flex items-center justify-between bg-transparent flex-shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                const newTheme = normalTheme === "light" ? "default" : "light";
                setNormalTheme(newTheme);
                if (typeof window !== "undefined") {
                  localStorage.setItem("normal_theme", newTheme);
                }
              }}
              className="h-8 w-8 text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-hover)] hover:bg-[var(--sidebar-hover-bg)] rounded-lg transition-all"
            >
              {normalTheme === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout} 
              disabled={logoutLoading} 
              className="text-xs gap-1.5 text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-hover)] hover:bg-[var(--sidebar-hover-bg)] transition-all h-8 px-2.5 rounded-lg"
            >
              <Ic.LogOut />
              {logoutLoading ? "..." : "Sign out"}
            </Button>
          </div>
        </aside>

        {/* ── CENTER PANEL ───────────────────────────────────────────────── */}
        <main className={`flex-1 overflow-y-auto flex flex-col pb-20 md:pb-0 ${isCute ? "bg-transparent" : "bg-background"}`}>
          {/* Top Breadcrumb Bar */}
          {!activeSession && (
            <header className="h-14 border-b border-[var(--border-sidebar)]/60 bg-[var(--bg-sidebar)]/85 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-10 sticky top-0">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground select-none min-w-0">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="md:hidden p-1.5 -ml-1 text-foreground hover:bg-muted/60 rounded-lg shrink-0"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <span className="hidden sm:inline">Dashboard</span>
                <span className="hidden sm:inline text-[10px] text-muted-foreground/50">/</span>
                {uploadSuccess && polledSpeechDetails ? (
                  <span className="text-foreground truncate max-w-[150px] sm:max-w-[200px]">
                    {polledSpeechDetails?.topics?.title || "Speech Evaluation"}
                  </span>
                ) : (
                  <span className="text-foreground truncate">
                    {activeTab === "console" ? "Practice Console" :
                     activeTab === "tracks" ? "Interview Tracks" :
                     activeTab === "library" ? "Knowledge Library" : "AI Coach"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {uploadSuccess && polledSpeechDetails?.overall_score !== null && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] text-[10px] font-extrabold uppercase tracking-wide">
                    <span>Score:</span>
                    <span className="tabular-nums">{polledSpeechDetails?.overall_score}/100</span>
                  </div>
                )}
                {/* Mobile Theme Toggle */}
                <button 
                  onClick={() => {
                    const newTheme = normalTheme === "light" ? "default" : "light";
                    setNormalTheme(newTheme);
                    if (typeof window !== "undefined") {
                      localStorage.setItem("normal_theme", newTheme);
                    }
                  }}
                  className="md:hidden p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
                  aria-label="Toggle theme"
                >
                  {normalTheme === "light" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                </button>
              </div>
            </header>
          )}

          {activeSession ? (
            renderActiveSessionPanel()
          ) : (
            <>
              {/* Welcome */}
              {!uploadSuccess&&(
            <div className="p-6 max-w-2xl mx-auto space-y-6 animate-bloom">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center w-full gap-4">
                    <div>
                      {moduleType === "interview_preparation" ? (
                        activeTrack ? (
                          <Button 
                            variant="ghost" 
                            size="xs" 
                            onClick={() => setActiveTrack(null)}
                            className="text-[10px] font-bold h-7 gap-1 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                          >
                            ← Back to Pathways
                          </Button>
                        ) : (
                          <>
                            <h1 className="text-base font-black text-foreground tracking-tight flex items-center gap-1.5">
                              {isCute ? "Interview Prep Pathway 🎯" : "Interview Preparation"}
                            </h1>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Practice realistic interview questions and follow-ups.
                            </p>
                          </>
                        )
                      ) : (
                        <>
                          <h1 className="text-base font-black text-foreground tracking-tight flex items-center gap-1.5">
                            {isCute ? (
                              <span className="flex items-center gap-2">
                                Good morning, {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Speaker"}! 🌸
                              </span>
                            ) : (
                              "Practice Terminal"
                            )}
                          </h1>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {isCute ? "Let's grow confidence, one speech at a time." : "Generate a custom topic and record your practice speech inline."}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex p-0.5 rounded-lg bg-muted/60 text-[10px] gap-0.5 shrink-0 border border-border/10 backdrop-blur-sm">
                      <button
                        onClick={() => setActiveTab("console")}
                        className={`px-3 py-1 rounded-md font-semibold transition-all ${activeTab === "console" ? "bg-card text-foreground shadow-sm scale-[1.02]" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                      >
                        Console
                      </button>
                      {moduleType === "interview_preparation" && (
                        <button
                          onClick={() => { setActiveTab("tracks"); fetchTrackStats(); }}
                          className={`px-3 py-1 rounded-md font-semibold transition-all ${activeTab === "tracks" ? "bg-card text-foreground shadow-sm scale-[1.02]" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                        >
                          Tracks
                        </button>
                      )}
                      <button
                        onClick={() => { setActiveTab("library"); }}
                        className={`px-3 py-1 rounded-md font-semibold transition-all ${activeTab === "library" ? "bg-card text-foreground shadow-sm scale-[1.02]" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                      >
                        Library
                      </button>
                      <button
                        onClick={() => { setActiveTab("coach"); }}
                        className={`px-3 py-1 rounded-md font-semibold transition-all ${activeTab === "coach" ? "bg-card text-foreground shadow-sm scale-[1.02]" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                      >
                        AI Coach
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {moduleType === "interview_preparation" && activeTab === "tracks" ? (
                renderInterviewTracks()
              ) : activeTab === "library" ? (
                renderKnowledgeLibrary()
              ) : activeTab === "coach" ? (
                renderAICoach()
              ) : (
                <>
                  {/* Topic Generator Card inline */}
                  <Card className={isCute ? "border-[rgba(21,46,27,0.14)] bg-white/40" : "border-border/85 bg-card"}>
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Topic Generator</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <form onSubmit={handleGenerateTopic} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <Label htmlFor="custom-topic" className="text-[10px] font-bold text-foreground/80">Custom topic (optional)</Label>
                          <Input id="custom-topic" value={customTopic} onChange={e=>setCustomTopic(e.target.value)}
                            placeholder="e.g. benefits of remote work, my leadership story..." className="text-xs h-9"/>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-[10px] font-bold text-foreground/80">Module</Label>
                          <Select value={moduleType} onValueChange={v=>v&&setModuleType(v as any)}>
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue>{moduleType === "public_speaking" ? "Public Speaking" : "Interview Prep"}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public_speaking">Public Speaking</SelectItem>
                              <SelectItem value="interview_preparation">Interview Preparation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {moduleType === "public_speaking" ? (
                            <div className="flex flex-col gap-1">
                              <Label className="text-[10px] font-bold text-foreground/80">Category</Label>
                              <Select value={category} onValueChange={v=>v&&setCategory(v)}>
                                <SelectTrigger className="h-9 text-xs">
                                  <SelectValue>{category === "impromptu" ? "Impromptu" : category === "interview" ? "Job Interview" : category === "persuasive" ? "Persuasive" : category === "warmup" ? "Warmup" : category === "debate" ? "Debate" : category}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="impromptu">Impromptu</SelectItem>
                                  <SelectItem value="interview">Job Interview</SelectItem>
                                  <SelectItem value="persuasive">Persuasive</SelectItem>
                                  <SelectItem value="warmup">Warmup</SelectItem>
                                  <SelectItem value="debate">Debate</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <Label className="text-[10px] font-bold text-foreground/80">Interview Type</Label>
                              <Select value={interviewType} onValueChange={v=>v&&setInterviewType(v)}>
                                <SelectTrigger className="h-9 text-xs">
                                  <SelectValue>{INTERVIEW_TYPES.find(t=>t.value===interviewType)?.label||interviewType}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {INTERVIEW_TYPES.map(t=> (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          <div className="flex flex-col gap-1">
                            <Label className="text-[10px] font-bold text-foreground/80">Difficulty</Label>
                            <Select value={difficulty} onValueChange={v=>v&&setDifficulty(v)}>
                              <SelectTrigger className="h-9 text-xs">
                                <SelectValue>{difficulty === "easy" ? "Easy" : difficulty === "medium" ? "Medium" : difficulty === "hard" ? "Hard" : difficulty}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {moduleType === "interview_preparation" && (
                          <div className="flex flex-col gap-1">
                            <Label className="text-[10px] font-bold text-foreground/80">Interview Style</Label>
                            <Select value={interviewPersona} onValueChange={v=>v&&setInterviewPersona(v)}>
                              <SelectTrigger className="h-9 text-xs">
                                <SelectValue>{INTERVIEW_PERSONAS.find(p=>p.value===interviewPersona)?.label||interviewPersona}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {INTERVIEW_PERSONAS.map(p=> (
                                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <Button type="submit" disabled={topicLoading} className="w-full h-9 text-xs font-bold" style={primaryBtnStyle}>
                          {topicLoading ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1.5"/>Generating...</> : "Generate Topic"}
                        </Button>
                        {topicError && <p className="text-[10px] text-destructive font-medium">{topicError}</p>}
                      </form>
                    </CardContent>
                  </Card>

                  {isCute && renderLeafDivider()}

                  {activeTopic ? (
                    <div className="space-y-4 animate-bloom">
                      <Card className={`border ${accentBorderClass} ${accentBgClass} relative overflow-visible`}>
                        <CardContent className="p-4 flex gap-4 justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-start gap-2 mb-1.5">
                              <p className={`font-bold text-xs leading-snug ${accentTextClass}`}>{activeTopic.title}</p>
                              <Badge variant="secondary" className="text-[8px] uppercase shrink-0 bg-muted text-muted-foreground border border-border">{difficulty}</Badge>
                            </div>
                            <p className="text-xs text-foreground/80 leading-relaxed mb-3">{activeTopic.prompt}</p>
                            {activeTopic.module_type === "interview_preparation" ? (
                              <div className="space-y-3">
                                {activeTopic.context && (
                                  <div>
                                    <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Scenario/Context</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{activeTopic.context}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Evaluation Focus</p>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    The interviewer is evaluating your <strong>Confidence</strong>, <strong>Professionalism</strong>, <strong>Readiness</strong>, <strong>Structure</strong>, and <strong>Relevance</strong>.
                                  </p>
                                </div>
                                {activeTopic.suggested_points?.length > 0 && (
                                  <div>
                                    <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Suggested Answer Structure</p>
                                    <ul className="space-y-1.5">
                                      {activeTopic.suggested_points.map((p, i) => (
                                        <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                                          <span className="shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white mt-0.5 bg-[var(--accent-color)]">{i+1}</span>
                                          {p}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ) : (
                              activeTopic.suggested_points?.length > 0 && (
                                <div>
                                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Talking Points</p>
                                  <ul className="space-y-1.5">
                                    {activeTopic.suggested_points.map((p, i) => (
                                      <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                                        <span className="shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white mt-0.5 bg-[#fb7185]">{i+1}</span>
                                        {p}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )
                            )}
                          </div>
                          {isCute && (
                            <div className="relative w-24 h-24 shrink-0 select-none pointer-events-none mt-2 self-end">
                              <div className="absolute -bottom-1 -left-2 text-[10px] animate-pulse">🌸 🌼 🌸</div>
                              <img src="/cute_garden_puppy.png" alt="Peeking Puppy" className="w-24 h-24 object-contain animate-float-leaf" style={{ "--duration": "8s" } as any} />
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className={`transition-all duration-500 ${
                        isCute ? "border-[rgba(21,46,27,0.14)] bg-white/40" : "border-border/85 bg-card"
                      } ${isCute && recordingState === "recording" ? "animate-pulse-glow" : ""}`}>
                        <CardHeader className="pb-2 pt-4 px-4">
                          <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Record Your Response</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 flex flex-col gap-3">
                          <div className="text-center">
                            <p className="text-4xl font-black tracking-tighter tabular-nums text-foreground" style={{fontFamily:"'SF Mono',monospace"}}>{ft(recordSeconds)}</p>
                            {recordingState === "recording" && <div className="flex items-center justify-center gap-1.5 mt-1.5"><span className="rec-pulse w-2 h-2 rounded-full bg-red-500"/><span className="text-[9px] font-bold tracking-widest text-red-500">REC</span></div>}
                            {recordingState === "paused" && <p className="text-[9px] font-bold tracking-widest text-[#854d0e] mt-1.5">PAUSED</p>}
                          </div>
                          {recordingState === "recording" && (
                            <div className="h-8 flex items-center justify-center gap-[2px] overflow-hidden">
                              {Array.from({length:32}).map((_,i)=>{
                                const hs=[8,14,20,10,24,16,12,28,18,10,22,16,8,20,14,26,12,18,10,24,16,8,20,14,28,12,18,10,22,16,8,20];
                                return <div key={i} className={`w-[2.5px] rounded-sm 
                                  ${isCute ? (i % 2 === 0 ? "bg-[#eab308]" : "bg-[#568764]") : "bg-indigo-500"}`} 
                                  style={{height:`${hs[i%hs.length]}px`,animation:`recPulse ${0.8+i*0.04}s ease-in-out infinite`,animationDelay:`${i*0.03}s`}}/>;
                              })}
                            </div>
                          )}
                          {recordingState === "idle" && (
                            <Button onClick={startRecording} className="w-full h-9 gap-1.5 font-bold text-xs" style={primaryBtnStyle}><Ic.Mic/>Start Recording</Button>
                          )}
                          {recordingState === "recording" && (
                            <div className="flex gap-2">
                              <Button variant="outline" onClick={pauseRecording} className="flex-1 h-9 text-xs">Pause</Button>
                              <Button variant="destructive" onClick={()=>stopStream()} className="flex-1 h-9 text-xs">Stop</Button>
                            </div>
                          )}
                          {recordingState === "paused" && (
                            <div className="flex gap-2">
                              <Button variant="outline" onClick={resumeRecording} className={`flex-1 h-9 text-xs ${accentBorderClass} ${accentTextClass}`}>Resume</Button>
                              <Button variant="destructive" onClick={()=>stopStream()} className="flex-1 h-9 text-xs">Stop</Button>
                            </div>
                          )}
                          {recordingState === "stopped" && (
                            <div className="flex flex-col gap-3.5">
                              <div className="rounded-lg border border-border bg-muted/40 p-2.5">
                                <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                                  <span className="font-medium text-foreground">Duration: {ft(recordSeconds)}</span>
                                  {audioBlob && <span>{(audioBlob.size/1048576).toFixed(2)} MB</span>}
                                </div>
                                <audio src={audioUrl||""} controls className="w-full h-8 rounded"/>
                              </div>
                              {recordSeconds < 10 && <p className="text-[10px] text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-2.5 py-1.5 font-semibold">Speech must be at least 10 seconds long.</p>}
                              {uploadError && <p className="text-[10px] text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-2.5 py-1.5 font-semibold">{uploadError}</p>}
                              <div className="flex gap-2">
                                <Button onClick={handleSubmitSpeech} disabled={isUploading||recordSeconds<10} className="flex-1 h-9 text-xs font-bold" style={primaryBtnStyle}>
                                  {isUploading?<><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1.5"/>Uploading...</>:"Submit for Evaluation"}
                                </Button>
                                <Button variant="outline" onClick={discardRecording} disabled={isUploading} className="h-9 text-xs">Discard</Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className={`text-center p-4 rounded-xl flex items-center justify-center gap-2 border ${
                      isCute 
                        ? "bg-[#fff0f3] border-[#ffe4e6] text-[#9f1239] font-bold" 
                        : "bg-muted/30 border-border text-muted-foreground font-medium"
                    }`}>
                      <span className="text-sm">✨</span>
                      <p className="text-[10px]">
                        {isCute 
                          ? "Your Speech Coaching Garden is ready. Generate a topic above to begin practicing!" 
                          : "Practice Terminal is ready. Generate a topic above to begin practicing!"
                        }
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Processing */}
          {isProcessing&&(
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="flex gap-1.5">
                {[0,0.15,0.3].map((d,i)=><span key={i} className="w-2.5 h-2.5 rounded-full rec-pulse bg-[var(--accent-color)]" style={{animationDelay:`${d}s`}}/>)}
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold text-foreground mb-1">{speech?`Processing — ${speech.status}`:"Connecting to pipeline..."}</h2>
                <p className="text-sm text-muted-foreground">
                  {speech?.status==="transcribing"&&"Transcribing your audio using speech models..."}
                  {speech?.status==="analyzing"&&"Analysing delivery, pacing, and vocabulary..."}
                  {!speech&&"Uploading and initialising the evaluation pipeline..."}
                </p>
              </div>
              {/* Skeleton preview of results */}
              <div className="w-full max-w-lg space-y-3 mt-2">
                <div className="skeleton-pulse h-4 w-3/4 mx-auto"></div>
                <div className="skeleton-pulse h-3 w-1/2 mx-auto"></div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="skeleton-pulse h-16 rounded-lg"></div>
                  <div className="skeleton-pulse h-16 rounded-lg"></div>
                  <div className="skeleton-pulse h-16 rounded-lg"></div>
                </div>
                <div className="skeleton-pulse h-24 rounded-lg mt-2"></div>
              </div>
            </div>
          )}

          {/* Failed */}
          {isFailed&&speech&&(
            <div className="p-8 max-w-2xl">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
                <span>History</span><Ic.Chevron/><span className="text-foreground font-medium">{speech.topics?.title||"Impromptu Speech"}</span>
              </div>
              <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                  <h1 className="text-2xl font-black text-foreground mb-1 tracking-tight">{speech.topics?.title||"Impromptu Speech"}</h1>
                  <p className="text-sm text-muted-foreground">{fLong(speech.created_at)} · {fd(speech.duration_seconds)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {activeTopic && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setUploadSuccess(false);
                        setPolledSpeechId(null);
                        setPolledSpeechDetails(null);
                      }} 
                      className="gap-1.5 text-xs h-9 border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10 font-bold"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                      Back to Practice
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => { setTopics([]); setShowDrawer(true); }} className="gap-1.5 text-xs h-9">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    New Topic
                  </Button>
                  <Button onClick={()=>setShowDrawer(true)} className="gap-2 shrink-0" style={primaryBtnStyle}><Ic.Mic/>Practice Again</Button>
                </div>
              </div>
              <Card className="border-destructive/20 bg-destructive/5 text-center rounded-xl">
                <CardContent className="pt-8 pb-8 space-y-3">
                  <div className="mx-auto w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--destructive))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  </div>
                  <p className="font-bold text-destructive">Evaluation Failed</p>
                  <p className="text-sm text-destructive/70 leading-relaxed max-w-sm mx-auto">We couldn&apos;t transcribe or evaluate this recording. Please check your microphone and try again.</p>
                  <Button variant="destructive" className="mt-2" onClick={()=>{discardSpeechAndReset();setShowDrawer(true);}}>Retry Recording</Button>
                </CardContent>
              </Card>
            </div>
          )}

              {/* Completed */}
              {isCompleted&&speech&&(
                speech.is_session ? (
                  renderInterviewReplayScreen(speech)
                ) : (
                  <div className="flex flex-col lg:flex-row gap-6 p-6 md:p-8 max-w-6xl w-full mx-auto relative z-10 flex-1 overflow-y-auto">
                    
                    {/* Left Column: Core Speech Info & Transcript (65% width) */}
                    <div className="flex-1 min-w-0 space-y-6 animate-bloom">
                      
                      {/* Header */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <h1 className="text-2xl font-black text-foreground tracking-tight mb-1">{speech.topics?.title||"Impromptu Speech"}</h1>
                          <p className="text-sm text-muted-foreground">Recorded {fLong(speech.created_at)} · {fd(speech.duration_seconds)} duration</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {activeTopic && (
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setUploadSuccess(false);
                                setPolledSpeechId(null);
                                setPolledSpeechDetails(null);
                              }} 
                              className="gap-1.5 text-xs h-9 border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10 font-bold"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                              Back to Practice
                            </Button>
                          )}
                          <Button variant="outline" onClick={() => { setTopics([]); setShowDrawer(true); }} className="gap-1.5 text-xs h-9">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            New Topic
                          </Button>
                          <Button onClick={()=>setShowDrawer(true)} className="gap-2 shrink-0" style={primaryBtnStyle}><Ic.Mic/>Practice Again</Button>
                        </div>
                      </div>

                      {/* Overall Score Card */}
                      {speech.overall_score!==null&&(
                        <Card className={`overflow-hidden border-border/85 bg-gradient-to-r from-card to-muted/5 relative ${isCute ? "hover:border-[#fbbf24]/50" : ""}`}>
                          {isCute && (
                            <>
                              <span className="absolute top-1.5 left-2 text-xs select-none opacity-45 animate-float-leaf">🌿</span>
                              <span className="absolute bottom-1.5 right-2 text-xs select-none opacity-45 animate-float-leaf" style={{ animationDelay: '1s' }}>🌿</span>
                            </>
                          )}
                          <CardContent className="flex flex-col sm:flex-row items-center gap-6 py-6 px-6 relative z-10">
                            <div className="relative flex items-center justify-center shrink-0">
                              <svg className="w-20 h-20 -rotate-90">
                                <circle cx="40" cy="40" r="34" className="stroke-muted fill-none" strokeWidth="6" />
                                <circle cx="40" cy="40" r="34" 
                                  className="stroke-[var(--accent-color)] fill-none" 
                                  strokeWidth="6" 
                                  strokeDasharray={2 * Math.PI * 34} 
                                  strokeDashoffset={2 * Math.PI * 34 * (1 - speech.overall_score / 100)}
                                  strokeLinecap="round"
                                  style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black tracking-tight tabular-nums text-foreground">{speech.overall_score}</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground -mt-1">/ 100</span>
                              </div>
                            </div>
                            <div className="text-center sm:text-left flex-1 min-w-0">
                              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <span className="text-lg font-black tracking-tight text-[var(--accent-text)]">
                                  {scoreLabel(speech.overall_score)} Delivery
                                </span>
                                {stats && polledSpeechId === historyList[0]?.id && stats.score_delta_prev !== 0 && (
                                  <Badge className={`text-[10px] font-bold ${stats.score_delta_prev >= 0 ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20" : "bg-red-500/10 text-red-700 hover:bg-red-500/20"}`}>
                                    {stats.score_delta_prev >= 0 ? "+" : ""}{stats.score_delta_prev} pts vs prev
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                This score reflects pronunciation accuracy, fluency tempo, structural layout, and vocabulary quality. Your delivery is strong in grammar.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Spoken Transcript Analyzer */}
                      {speech.transcript && (() => {
                        const { fillerCount, suggestCount, avoidCount } = (() => {
                          const pattern = `(\\[suggest break\\]|\\[do not break\\]|\\b(?:${FILLERS.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b)`;
                          const regex = new RegExp(pattern, "gi");
                          const parts = speech.transcript!.split(regex);
                          let fCount = 0;
                          let sCount = 0;
                          let aCount = 0;
                          parts.forEach((p, i) => {
                            if (i % 2 === 1) {
                              const lower = p.toLowerCase();
                              if (lower === "[suggest break]") {
                                sCount++;
                              } else if (lower === "[do not break]") {
                                aCount++;
                              } else {
                                fCount++;
                              }
                            }
                          });
                          return { fillerCount: fCount, suggestCount: sCount, avoidCount: aCount };
                        })();

                        const handleCopy = () => {
                          if (!speech.transcript) return;
                          const cleanText = speech.transcript
                            .replace(/\[suggest break\]/gi, "")
                            .replace(/\[do not break\]/gi, "")
                            .replace(/\s+/g, " ")
                            .trim();
                          navigator.clipboard.writeText(cleanText);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        };

                        const renderSpokenText = () => {
                          const pattern = `(\\[suggest break\\]|\\[do not break\\]|\\b(?:${FILLERS.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b)`;
                          const regex = new RegExp(pattern, "gi");
                          const parts = speech.transcript!.split(regex);
                          return parts.map((p, i) => {
                            if (i % 2 === 1) {
                              const lower = p.toLowerCase();
                              if (lower === "[suggest break]") {
                                return (
                                  <span 
                                    key={i} 
                                    title="Suggested pause"
                                    className="inline-block w-[6px] h-[6px] rounded-full bg-[#1D9E75]/80 mx-[3px] align-middle select-none cursor-help"
                                  />
                                );
                              } else if (lower === "[do not break]") {
                                return (
                                  <span 
                                    key={i} 
                                    title="Avoid pausing here"
                                    className="inline-block w-[6px] h-[6px] rounded-full bg-[#BA7517]/80 mx-[3px] align-middle select-none cursor-help"
                                  />
                                );
                              } else {
                                return (
                                  <span 
                                    key={i} 
                                    className="inline-block bg-[#FCEBEB] text-[#A32D2D] border-[0.5px] border-[#F09595] rounded px-[5px] py-[1px] text-[13px] font-medium hover:scale-[1.05] cursor-pointer transition-transform duration-100 ease-out select-text"
                                  >
                                    {p}
                                  </span>
                                );
                              }
                            }
                            return p;
                          });
                        };

                        return (
                          <div className="py-6 px-0 bg-transparent flex flex-col font-sans" style={{ color: "var(--transcript-text)" }}>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase select-none" style={{ color: "var(--transcript-muted)" }}>
                                SPOKEN TRANSCRIPT
                              </span>
                              <div className="flex items-center gap-2 ml-auto mr-4">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/[0.04] border border-red-500/10 text-[10px] font-bold text-red-500/90 select-none dark:bg-red-950/[0.15]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#E24B4A] animate-pulse" />
                                  Filler words
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/[0.04] border border-emerald-500/10 text-[10px] font-bold text-emerald-600/90 select-none dark:bg-emerald-950/[0.15]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
                                  Suggested break
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/[0.04] border border-amber-500/10 text-[10px] font-bold text-amber-600/90 select-none dark:bg-amber-950/[0.15]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#BA7517]" />
                                  Avoid break
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="xs"
                                onClick={handleCopy}
                                className="gap-1.5 text-xs font-semibold"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                <span>{copied ? "Copied ✓" : "Copy"}</span>
                              </Button>
                            </div>
                            <div className="border-[0.5px] rounded-[12px] py-5 px-6 max-h-[320px] overflow-y-auto" style={{ backgroundColor: "var(--transcript-bg)", borderColor: "var(--transcript-border)" }}>
                              <p 
                                onDoubleClick={handleTextDoubleClick}
                                className="text-[15px] font-normal whitespace-pre-wrap cursor-pointer select-text"
                                style={{ color: "var(--transcript-text)", lineHeight: "2.0" }}
                              >
                                {renderSpokenText()}
                              </p>
                            </div>
                            <div className="grid grid-cols-3 gap-3 mt-4">
                              {/* Filler Words Card */}
                              <div className="border border-border/50 border-l-4 border-l-red-500 rounded-r-lg py-3 px-4 flex flex-col justify-between bg-red-500/[0.02] dark:bg-red-950/[0.1] transition-all hover:shadow-sm">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/90 select-none">Filler words</span>
                                <div className="flex items-baseline justify-between mt-1">
                                  <span className="text-2xl font-black text-red-500 tabular-nums">{fillerCount}</span>
                                  <span className="text-[10px] text-red-500/70 font-semibold">{fillerCount > 0 ? "⚠️ Optimize" : "✓ Perfect"}</span>
                                </div>
                              </div>
                              {/* Suggested Breaks Card */}
                              <div className="border border-border/50 border-l-4 border-l-[#1D9E75] rounded-r-lg py-3 px-4 flex flex-col justify-between bg-[#1D9E75]/[0.02] dark:bg-emerald-950/[0.1] transition-all hover:shadow-sm">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/90 select-none">Suggested breaks</span>
                                <div className="flex items-baseline justify-between mt-1">
                                  <span className="text-2xl font-black text-[#1D9E75] tabular-nums">{suggestCount}</span>
                                  <span className="text-[10px] text-[#1D9E75]/70 font-semibold">{suggestCount > 0 ? "⚡ Pauses" : "✓ Steady"}</span>
                                </div>
                              </div>
                              {/* Avoid Breaks Card */}
                              <div className="border border-border/50 border-l-4 border-l-[#BA7517] rounded-r-lg py-3 px-4 flex flex-col justify-between bg-[#BA7517]/[0.02] dark:bg-amber-950/[0.1] transition-all hover:shadow-sm">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/90 select-none">Avoid breaks</span>
                                <div className="flex items-baseline justify-between mt-1">
                                  <span className="text-2xl font-black text-[#BA7517] tabular-nums">{avoidCount}</span>
                                  <span className="text-[10px] text-[#BA7517]/70 font-semibold">{avoidCount > 0 ? "⚠️ Haste" : "✓ Smooth"}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Debate challenge */}
                      {counterArgument && (
                        <Card className="border-amber-200/85 bg-amber-50/20 dark:bg-amber-950/10 dark:border-amber-500/20 shadow-sm">
                          <CardHeader className="pb-3 pt-4 px-5">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Debate Challenge</CardTitle>
                          </CardHeader>
                          <CardContent className="px-5 pb-5">
                            <div className="pl-3.5 border-l-2 border-amber-400 dark:border-amber-500 italic text-xs text-foreground/90 dark:text-amber-100/90 leading-relaxed mb-4 whitespace-pre-wrap">
                              {counterArgument}
                            </div>
                            <Button 
                              onClick={handleTryAnsweringDebate}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all shadow-sm w-full md:w-auto"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                              Try Answering This
                            </Button>
                          </CardContent>
                        </Card>
                      )}

                      {/* Follow-Up Question */}
                      {speech.feedback?.follow_up_question && (
                        <Card className="border-emerald-200/85 bg-emerald-50/10 dark:bg-emerald-950/5 dark:border-emerald-500/20 shadow-sm">
                          <CardHeader className="pb-2 pt-4 px-5">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Interviewer Follow-Up Question</CardTitle>
                          </CardHeader>
                          <CardContent className="px-5 pb-5">
                            <div className="pl-3.5 border-l-2 border-emerald-400 dark:border-emerald-500 italic text-xs text-foreground/90 dark:text-amber-100/90 leading-relaxed mb-4 whitespace-pre-wrap">
                              {speech.feedback.follow_up_question}
                            </div>
                            <Button 
                              onClick={handleTryAnsweringFollowUp}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all shadow-sm w-full md:w-auto"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                              Answer Follow-Up Question
                            </Button>
                          </CardContent>
                        </Card>
                      )}

                      {/* Recommended Reading */}
                      {speech.overall_score!==null&&libraryRecommendations.length>0&&(
                        <div className="space-y-3">
                          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground select-none">Recommended Reading</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {libraryRecommendations.map((rec) => (
                              <Card key={rec.id} 
                                onClick={() => {
                                  setSelectedArticle(rec);
                                  setActiveTab("library");
                                }}
                                className={`group cursor-pointer hover:-translate-y-0.5 transition-all bg-gradient-to-b from-card to-muted/5 border-border/85 relative overflow-hidden ${isCute ? "hover:border-[#eab308]/40" : "hover:border-border"}`}
                              >
                                {isCute && <span className="absolute top-1.5 right-2 text-xs select-none opacity-20">🍃</span>}
                                <CardContent className="p-4 flex flex-col justify-between h-full">
                                  <div>
                                    <h3 className="text-xs font-bold text-foreground leading-snug group-hover:text-[var(--accent-text)] transition-colors line-clamp-1">{rec.title}</h3>
                                    <p className="text-[10px] text-muted-foreground leading-normal mt-1 line-clamp-2">
                                      {rec.content.replace(/[#*`>!\[\]]/g, "").replace(/\(https?:\/\/[^\s)]+\)/g, "").replace(/https?:\/\/[^\s]+/g, "").replace(/\s{2,}/g, " ").trim().slice(0, 100)}...
                                    </p>
                                  </div>
                                  <div className="mt-2 text-right">
                                    <span className="text-[9px] font-extrabold text-[var(--accent-color)] group-hover:underline">Read Article →</span>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 text-center">
                        <Button variant="outline" onClick={()=>{discardSpeechAndReset();setShowDrawer(true);}}>Practice Another Topic</Button>
                      </div>

                    </div>

                    {/* Right Column: Coach Feedback, Vocabulary, and Metrics (35% width / 360px) */}
                    <div className="w-full lg:w-[360px] shrink-0">
                      <div className="sticky top-6 space-y-4">
                        <Card className="border-border/85 bg-card/65 backdrop-blur-md">
                          
                          {/* Tab Switcher */}
                          <div className="p-3 border-b border-border flex-shrink-0 bg-muted/5">
                            <div className="flex p-0.5 rounded-lg bg-muted/60 text-xs">
                              {(["feedback", "vocab", "progress"] as const).map((tab) => {
                                const active = rightTab === tab;
                                const label = tab === "feedback" ? "Feedback" : tab === "vocab" ? "Vocab" : "Metrics";
                                return (
                                  <button
                                    key={tab}
                                    onClick={() => setRightTab(tab)}
                                    className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-all ${
                                      active 
                                        ? "bg-card text-foreground shadow-sm" 
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <CardContent className="p-4">
                            
                            {/* Feedback Tab content */}
                            {rightTab === "feedback" && (
                              <div className="space-y-4 anim-fadeup">
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground select-none mb-1">Coach Feedback</p>
                                {coachFeedback.length > 0 ? (
                                  coachFeedback.map((item, i) => {
                                    const isPositive = item.type === "positive";
                                    const isWarning = !isPositive && item.type === "warning";
                                    
                                    const cardBg = isPositive 
                                      ? "bg-emerald-500/[0.02] border-l-emerald-500 dark:bg-emerald-950/[0.12]" 
                                      : isWarning 
                                      ? "bg-amber-500/[0.02] border-l-amber-500 dark:bg-amber-950/[0.12]" 
                                      : "bg-blue-500/[0.02] border-l-blue-500 dark:bg-blue-950/[0.12]";
                                      
                                    const iconColor = isPositive ? "text-emerald-500" : isWarning ? "text-amber-500" : "text-blue-500";
                                    const bulletColor = isPositive ? "text-emerald-500/80" : isWarning ? "text-amber-500/80" : "text-blue-500/80";

                                    const points = item.body
                                      .split(/(?:\s-\s|^-\s|\s•\s|^•\s)/)
                                      .map(p => p.trim())
                                      .filter(p => p.length > 0);

                                    const showBody = item.body && item.body.trim() !== item.title.trim();

                                    return (
                                      <div 
                                        key={i} 
                                        className={`p-3.5 rounded-r-lg border-l-4 border-y border-r border-y-border/30 border-r-border/30 ${cardBg} transition-all duration-300 hover:shadow-sm`}
                                      >
                                        <div className="flex gap-2.5 items-start">
                                          {isPositive && (
                                            <svg className={`w-4 h-4 ${iconColor} shrink-0 mt-0.5`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                          )}
                                          {isWarning && (
                                            <svg className={`w-4 h-4 ${iconColor} shrink-0 mt-0.5`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                                          )}
                                          {!isPositive && !isWarning && (
                                            <svg className={`w-4 h-4 ${iconColor} shrink-0 mt-0.5`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                                          )}
                                          <div className="min-w-0 flex-1">
                                            <p className="text-xs font-black text-foreground tracking-tight">{item.title}</p>
                                            
                                            {showBody && (
                                              points.length > 1 ? (
                                                <ul className="space-y-2 list-none mt-2">
                                                  {points.map((pt, idx) => (
                                                    <li key={idx} className="flex gap-2 text-[11px] text-muted-foreground leading-relaxed align-top">
                                                      <span className={`${bulletColor} shrink-0 mt-1 text-[8px]`}>✦</span>
                                                      <span>{pt}</span>
                                                    </li>
                                                  ))}
                                                </ul>
                                              ) : (
                                                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5">{item.body}</p>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="text-center py-6 text-xs text-muted-foreground">No feedback items for this session.</div>
                                )}
                              </div>
                            )}

                            {/* Vocab Tab content */}
                            {rightTab === "vocab" && (
                              <div className="space-y-4 anim-fadeup">
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground select-none mb-1">Vocabulary Upgrades</p>
                                {lexiconSuggestions.length > 0 ? (
                                  <div className="space-y-3">
                                    {lexiconSuggestions.slice(0, 4).map((rawItem: any, i: number) => {
                                      const norm = typeof rawItem === "string" ? {
                                        original_word: "Word Choice",
                                        suggested_replacement: rawItem,
                                        explanation: `Try incorporating "${rawItem}" to enhance vocabulary impact.`
                                      } : {
                                        original_word: rawItem?.original_word || rawItem?.word || "Word Choice",
                                        suggested_replacement: rawItem?.suggested_replacement || rawItem?.suggestion || rawItem?.replacement || "Suggested Word",
                                        explanation: rawItem?.explanation || `Consider using "${rawItem?.suggested_replacement || rawItem?.suggestion || "a stronger term"}" for clarity.`
                                      };

                                      return (
                                        <Card key={i} className="p-3.5 space-y-2.5 transition-all shadow-none border border-border/40 hover:border-[var(--accent-color)]/30 hover:shadow-sm bg-card/65">
                                          <CardContent className="p-0 space-y-2.5">
                                            <div className="grid grid-cols-[1fr_24px_1fr] items-center gap-1 w-full bg-muted/40 dark:bg-muted/15 p-2 rounded-lg border border-border/10">
                                              <div className="text-left min-w-0">
                                                <span className="text-xs line-through text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded font-mono font-bold block truncate" title={norm.original_word}>
                                                  {norm.original_word}
                                                </span>
                                              </div>
                                              <div className="flex justify-center text-muted-foreground/60 shrink-0">
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                              </div>
                                              <div className="text-left min-w-0">
                                                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 block truncate" title={norm.suggested_replacement}>
                                                  {norm.suggested_replacement}
                                                </span>
                                              </div>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed font-normal pl-0.5">
                                              {norm.explanation}
                                            </p>
                                          </CardContent>
                                        </Card>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 text-xs text-muted-foreground">No vocabulary suggestions for this session.</div>
                                )}
                              </div>
                            )}

                            {/* Metrics Tab content */}
                            {rightTab === "progress" && (
                              <div className="space-y-4 anim-fadeup">
                                <div className="space-y-3.5">
                                  <div className="flex justify-between items-center mb-1">
                                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Core Skills</p>
                                    <div className="flex p-0.5 rounded bg-muted/60 text-[9px] gap-0.5 border border-border/10 shrink-0 select-none">
                                      <button
                                        onClick={() => setMetricsView("bar")}
                                        className={`px-2 py-0.5 rounded font-bold transition-all ${metricsView === "bar" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                                      >
                                        Bars
                                      </button>
                                      <button
                                        onClick={() => setMetricsView("radar")}
                                        className={`px-2 py-0.5 rounded font-bold transition-all ${metricsView === "radar" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                                      >
                                        Radar
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {metricsView === "radar" ? (
                                    <RadarChart 
                                      scores={[
                                        speech.pronunciation_score || 0,
                                        speech.fluency_score || 0,
                                        speech.grammar_score || 0,
                                        speech.content_score || 0,
                                        speech.lexicon_score || 0
                                      ]} 
                                    />
                                  ) : (
                                    [
                                      {label:"Clarity & Enunciation",score:speech.pronunciation_score},
                                      {label:"Pacing & Pauses",score:speech.fluency_score},
                                      {label:"Grammar & Accuracy",score:speech.grammar_score},
                                      {label:"Content & Structure",score:speech.content_score},
                                      ...(speech.lexicon_score!=null?[{label:"Vocabulary & Lexicon",score:speech.lexicon_score}]:[]),
                                    ].map((skill,idx)=>skill.score!=null&&(
                                      <div key={skill.label}>
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-[11px] font-medium text-foreground/80">{skill.label}</span>
                                          <span className="text-[11px] font-bold text-foreground tabular-nums">{skill.score}/100</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                          <div className="h-full rounded-full transition-all duration-1000" style={{width:`${skill.score}%`,background:skillGradients[idx % skillGradients.length]}}/>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>

                                {speech.feedback?.interview_metrics && (
                                  <div className="space-y-3.5 pt-2 border-t border-border/60">
                                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Interview Performance</p>
                                    {[
                                      {label:"Confidence",score:speech.feedback.interview_metrics.confidence},
                                      {label:"Professionalism",score:speech.feedback.interview_metrics.professionalism},
                                      {label:"Interview Readiness",score:speech.feedback.interview_metrics.readiness},
                                      {label:"Answer Structure",score:speech.feedback.interview_metrics.structure},
                                      {label:"Relevance of Response",score:speech.feedback.interview_metrics.relevance},
                                    ].map((metric,idx)=>(
                                      <div key={metric.label}>
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-[11px] font-medium text-foreground/80">{metric.label}</span>
                                          <span className="text-[11px] font-bold text-foreground tabular-nums">{metric.score}/100</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                          <div className="h-full rounded-full transition-all duration-1000" style={{width:`${metric.score}%`,background:skillGradients[idx % skillGradients.length]}}/>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                          </CardContent>
                        </Card>
                        
                        {/* Right column footer stats / ads */}
                        <AdBanner placement="analytics-footer" hidden={shouldHideAds} />
                      </div>
                    </div>

                  </div>
              )
            )}
          </>
        )}
      </main>

        {/* ── RIGHT PANEL (DESKTOP) ───────────────────────────────────────── */}
        {(!uploadSuccess && isCute && !activeSession) && (
          <aside className="hidden lg:flex w-[320px] shrink-0 border-l border-[var(--border-sidebar)] bg-[var(--bg-sidebar)] flex-col overflow-hidden backdrop-blur-md">
            <div className="p-4 border-b border-[var(--border-sidebar)] flex justify-between items-center bg-transparent flex-shrink-0">
              <span className="font-bold text-[10px] uppercase tracking-wider text-[var(--sidebar-subtext)]/80">Gardening Stats</span>
            </div>

            <div className="px-4 shrink-0">{renderLeafDivider()}</div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {renderCuteProgress()}
              <AdBanner placement="analytics-footer" hidden={shouldHideAds} />
            </div>
          </aside>
        )}
      {/* Selected Article Drawer/Modal Overlay */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full sm:max-w-2xl h-full sm:h-auto max-h-[100dvh] sm:max-h-[85vh] flex flex-col border-0 sm:border border-border/80 bg-card shadow-2xl overflow-hidden rounded-none sm:rounded-2xl animate-zoom-in">
            {/* Header */}
            <div className="p-5 border-b border-border/40 flex justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {TRACKS_METADATA[selectedArticle.track]?.icon || "📚"} {selectedArticle.category}
                  </span>
                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                    selectedArticle.difficulty === "easy"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                      : selectedArticle.difficulty === "medium"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-600"
                        : "bg-destructive/10 border-destructive/20 text-destructive"
                  }`}>
                    {selectedArticle.difficulty}
                  </span>
                  {selectedArticle.is_completed && (
                    <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                      ✓ Completed
                    </span>
                  )}
                </div>
                <h2 className="text-sm font-black text-foreground tracking-tight mt-1">
                  {selectedArticle.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              >
                <Ic.X />
              </button>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 p-6 overflow-y-auto">
              <article className="prose prose-sm dark:prose-invert max-w-none">
                {renderMarkdown(selectedArticle.content)}
              </article>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-border/40 flex justify-between items-center bg-muted/20">
              <div className="flex gap-1.5 flex-wrap">
                {selectedArticle.tags?.map((tag: string) => (
                  <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedArticle(null)} className="text-xs h-8">
                  Close
                </Button>
                {!selectedArticle.is_completed ? (
                  <Button
                    size="sm"
                    onClick={() => handleMarkArticleCompleted(selectedArticle.id)}
                    className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Mark as Completed
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled className="text-xs h-8 bg-emerald-50 border-emerald-200 text-emerald-700 font-bold opacity-100 flex gap-1 items-center">
                    Completed ✓
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
      {/* ── MOBILE BOTTOM NAVIGATION BAR ─────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-sidebar)]/95 backdrop-blur-xl border-t border-[var(--border-sidebar)]/80 flex items-center justify-around z-40 md:hidden pb-safe px-2">
        {[
          { id: "console", label: "Console", icon: <Mic className="w-5 h-5" /> },
          { id: "tracks", label: "Tracks", icon: <Layers className="w-5 h-5" />, onSelect: () => { setModuleType("interview_preparation"); fetchTrackStats(); } },
          { id: "library", label: "Library", icon: <BookOpen className="w-5 h-5" /> },
          { id: "coach", label: "Coach", icon: <Bot className="w-5 h-5" /> },
        ].map(tab => {
          const active = !uploadSuccess && activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setUploadSuccess(false);
                setPolledSpeechId(null);
                setPolledSpeechDetails(null);
                if (tab.onSelect) tab.onSelect();
              }}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                active
                  ? "text-blue-500 dark:text-blue-400 font-extrabold"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              {tab.icon}
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl text-muted-foreground hover:text-foreground font-medium transition-all"
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">History</span>
        </button>
      </nav>

      {/* ── MOBILE SIDEBAR DRAWER OVERLAY ─────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative z-10 w-[290px] max-w-[85vw] h-full bg-[var(--bg-sidebar)] flex flex-col shadow-2xl border-r border-[var(--border-sidebar)] animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[var(--border-sidebar)]/60 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 select-none">
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-white font-black text-xs shadow-md" style={{ background: 'var(--logo-gradient)' }}>
                  S
                </div>
                <span className="font-black text-sm tracking-tight shrink-0 bg-clip-text text-transparent" style={{backgroundImage: "var(--logo-gradient)"}}>
                  SpeakAI Coach
                </span>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Links */}
            <div className="px-3 py-3 border-b border-[var(--border-sidebar)]/60 flex-shrink-0 space-y-1">
              {[
                { id: "console", label: "Practice Console", icon: <Mic className="w-4 h-4 shrink-0" /> },
                { id: "tracks", label: "Interview Tracks", icon: <Layers className="w-4 h-4 shrink-0" />, onSelect: () => { setModuleType("interview_preparation"); fetchTrackStats(); } },
                { id: "library", label: "Knowledge Library", icon: <BookOpen className="w-4 h-4 shrink-0" /> },
                { id: "coach", label: "AI Coach", icon: <Bot className="w-4 h-4 shrink-0" /> }
              ].map(tab => {
                const active = !uploadSuccess && activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setUploadSuccess(false);
                      setPolledSpeechId(null);
                      setPolledSpeechDetails(null);
                      setMobileSidebarOpen(false);
                      if (tab.onSelect) tab.onSelect();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      active
                        ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]"
                        : "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text-hover)]"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Practice History List */}
            <div className="p-3 pb-1.5 flex justify-between items-center flex-shrink-0">
              <span className="font-bold text-[10px] uppercase tracking-wider text-[var(--sidebar-subtext)]">Practice History</span>
              <span className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full bg-[var(--sidebar-active-bg)] border border-[var(--border-sidebar)] text-[var(--sidebar-active-text)]">
                {historyList.length} {historyList.length === 1 ? "session" : "sessions"}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <div className="p-3 space-y-3">
                {historyList.length === 0 ? (
                  <p className="text-xs text-[var(--sidebar-subtext)] text-center py-8">No sessions yet. Start practicing.</p>
                ) : (
                  getGroupedHistory().map(group => (
                    <div key={group.label} className="space-y-1">
                      <p className="text-[10px] font-extrabold tracking-widest text-muted-foreground/80 uppercase px-2 pt-2 pb-0.5">{group.label}</p>
                      {group.items.map(item => {
                        const sel = polledSpeechId === item.id;
                        return (
                          <button key={item.id}
                            onClick={()=>{
                              if (pollingRef.current) {
                                clearInterval(pollingRef.current);
                                pollingRef.current = null;
                              }
                              setPolledSpeechId(item.id);
                              fetchCompletedSessionDetails(item.id);
                              setMobileSidebarOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-md transition-all flex flex-col gap-1 ${
                              sel ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]" : "text-[var(--sidebar-text)]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 w-full">
                              <span className="text-xs font-semibold truncate">{item.topics?.title || "Speech Session"}</span>
                              {item.overall_score !== null && <span className="text-xs font-bold">{item.overall_score}</span>}
                            </div>
                            <span className="text-[10px] text-muted-foreground">{fd(item.duration_seconds)} • {fTime(item.created_at)}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-[var(--border-sidebar)] flex items-center justify-between flex-shrink-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout} 
                disabled={logoutLoading} 
                className="text-xs gap-1.5 text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-hover)] transition-all h-8 px-2.5 rounded-lg"
              >
                <Ic.LogOut />
                {logoutLoading ? "..." : "Sign out"}
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>

      {selectedWord && popoverPos && (
        <div 
          id="word-definition-popover"
          className="fixed z-50 min-w-[220px] max-w-[320px] bg-background/95 dark:bg-zinc-900/95 backdrop-blur-md border border-border/80 shadow-xl rounded-xl p-3.5 text-xs animate-in fade-in zoom-in-95 duration-100 text-foreground"
          style={{
            top: `${popoverPos.y}px`,
            left: `${popoverPos.x}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-border/40">
            <span className="font-bold text-foreground">Meaning of &ldquo;{selectedWord}&rdquo;</span>
            <button 
              onClick={() => { setSelectedWord(null); setDefinition(null); }}
              className="text-muted-foreground hover:text-foreground p-0.5 ml-2 font-medium"
            >
              ✕
            </button>
          </div>
          
          {isDefLoading ? (
            <div className="text-muted-foreground flex items-center gap-1.5 py-1">
              <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Searching definition...
            </div>
          ) : (
            <p className="text-foreground/90 leading-relaxed font-normal">{definition}</p>
          )}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
