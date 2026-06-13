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

// ── Interfaces ────────────────────────────────────────────────────────────────
interface GeneratedTopic {
  id?: string; title: string; prompt: string; context: string; suggested_points: string[];
}
interface LexiconSuggestion {
  original_word: string; suggested_replacement: string; explanation: string;
}
interface SpeechFeedback {
  written_feedback: string; lexicon_suggestions?: LexiconSuggestion[]; counter_argument?: string; challenge_questions?: string[];
}
interface SpeechHistoryItem {
  id: string; user_id: string; topic_id: string | null; storage_path: string; original_filename: string;
  mime_type: string; duration_seconds: number;
  status: "uploaded"|"transcribing"|"analyzing"|"completed"|"failed";
  transcript: string | null; feedback: SpeechFeedback | null; overall_score: number | null;
  pronunciation_score: number | null; fluency_score: number | null; grammar_score: number | null;
  content_score: number | null; lexicon_score: number | null; retry_count: number;
  created_at: string; topics?: GeneratedTopic | null;
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
const fd = (s: number) => { const m=Math.floor(s/60),r=s%60; return m===0?`${r}s`:r===0?`${m}m`:`${m}m ${r}s`; };
const fShort = (d: string) => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"});
const fLong  = (d: string) => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const fTime  = (d: string) => new Date(d).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true});
const scoreLabel = (s: number) => s>=85?"Excellent":s>=70?"Good":s>=55?"Developing":"Needs Work";

const FILLERS = ["like","um","uh","you know","kind of","sort of","basically","literally","actually","yeah","right","I mean"];
const highlightTranscript = (text: string|null): React.ReactNode => {
  if (!text) return null;
  const pattern = `(\\[suggest break\\]|\\[do not break\\]|${FILLERS.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`;
  const regex = new RegExp(pattern, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((p, i) => {
        if (i % 2 === 1) {
          const lower = p.toLowerCase();
          if (lower === "[suggest break]") {
            return (
              <mark 
                key={i} 
                className="bg-emerald-200 text-emerald-800 dark:bg-emerald-500/30 dark:text-emerald-300 rounded px-1.5 py-0.5 mx-0.5 font-semibold not-italic select-none"
                style={{ fontSize: "0.95em" }}
              >
                &nbsp;
              </mark>
            );
          } else if (lower === "[do not break]") {
            return (
              <mark 
                key={i} 
                className="bg-amber-200 text-amber-800 dark:bg-amber-500/30 dark:text-amber-300 rounded px-1.5 py-0.5 mx-0.5 font-semibold not-italic select-none"
                style={{ fontSize: "0.95em" }}
              >
                &nbsp;
              </mark>
            );
          } else {
            return (
              <mark 
                key={i} 
                className="bg-red-100 text-red-700 dark:bg-red-950/65 dark:text-red-300 rounded px-0.5 font-semibold not-italic" 
                style={{ fontSize: "0.95em" }}
              >
                {p}
              </mark>
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
  return text.split(/\n\n+/).filter(c=>c.trim()).slice(0,4).map(chunk => {
    const lines = chunk.trim().split("\n");
    const titleMatch = lines[0].match(/\*\*(.+?)\*\*/);
    const title = titleMatch ? titleMatch[1] : lines[0].replace(/\*\*/g,"").replace(/^[-•]\s*/,"");
    const body  = lines.slice(1).join(" ").trim().replace(/\*\*/g,"") || chunk.replace(/\*\*/g,"");
    const lc = title.toLowerCase();
    const type = ["excellent","strong","good","great","well","clear","effective","pacing"].some(w=>lc.includes(w)) ? "positive"
      : ["filler","avoid","issue","weak","dependency","lack","problem"].some(w=>lc.includes(w)) ? "warning" : "tip";
    return { title, body, type };
  });
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { user, session, supabase, loading, profile } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [category, setCategory] = useState("impromptu");
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
  const [cachedIsCute, setCachedIsCute] = useState<boolean>(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState<"all"|"this_month"|"high_score"|"low_score">("all");
  const [rightTab, setRightTab] = useState<"feedback" | "vocab" | "progress">("feedback");
  const [normalTheme, setNormalTheme] = useState<string>("default");
  
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
  useEffect(() => { if (!loading && !user) router.replace("/login"); }, [user, loading, router]);
  useEffect(() => { if (session) { fetchHistory(1); fetchStats(); } }, [session]);

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

  const startPollingSpeech=(id:string)=>{
    if(pollingRef.current)clearInterval(pollingRef.current);
    setPolledSpeechId(id);setPolledSpeechDetails(null);
    pollingRef.current=setInterval(async()=>{
      if(!session)return;
      try{const res=await fetch(`${getApiBaseUrl()}/api/speeches/${id}`,{headers:{Authorization:`Bearer ${session.access_token}`}});if(!res.ok)throw new Error();const data=await res.json();setPolledSpeechDetails(data);if(data.status==="completed"||data.status==="failed"){clearInterval(pollingRef.current);pollingRef.current=null;fetchHistory(1);fetchStats();}}catch{}
    },3000);
  };

  const fetchHistory=async(page:number)=>{
    if(!session)return;setHistoryLoading(true);setHistoryError(null);
    try{const res=await fetch(`${getApiBaseUrl()}/api/speeches?page=${page}&limit=10`,{headers:{Authorization:`Bearer ${session.access_token}`}});if(!res.ok)throw new Error();const data=await res.json();setHistoryList(data||[]);setHistoryPage(page);setHasMoreHistory(data?.length===10);}
    catch(e:any){setHistoryError("Failed to load history.");}
    finally{setHistoryLoading(false);}
  };

  const fetchStats=async()=>{
    if(!session)return;
    try{const res=await fetch(`${getApiBaseUrl()}/api/speeches/stats`,{headers:{Authorization:`Bearer ${session.access_token}`}});if(!res.ok)throw new Error();setStats(await res.json());}catch{}
  };

  const handleLogout=async()=>{if(!supabase)return;setLogoutLoading(true);try{await supabase.auth.signOut();router.replace("/login");}catch{}finally{setLogoutLoading(false);}};

  const handleGenerateTopic=async(e:React.FormEvent)=>{
    e.preventDefault();if(!session)return;
    setTopicLoading(true);setTopicError(null);discardRecording();
    try{
      let url=`${getApiBaseUrl()}/api/topics/generate?category=${category}&difficulty=${difficulty}`;
      if(customTopic.trim())url+=`&custom_topic=${encodeURIComponent(customTopic.trim())}`;
      const res=await fetch(url,{headers:{Authorization:`Bearer ${session.access_token}`}});
      if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.detail||`Error ${res.status}`);}
      const data=await res.json();if(data?.topics)setTopics(data.topics);
    }catch(e:any){setTopicError(e.message||"Failed to generate topic.");}
    finally{setTopicLoading(false);}
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

    historyList.forEach(item => {
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

  const isCute       = profile?.is_cute_mode === true;
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
  const primaryBtnStyle   = isCute ? {background:"#EC4899", color:"#FFFDF8", fontWeight:"800"} : {};
  const shouldHideAds     = recordingState !== "idle" || isProcessing || (!!speech && rightTab !== "progress");
  const themeRoot     = isCute 
    ? "theme-cute" 
    : normalTheme === "crimson" 
      ? "theme-crimson" 
      : normalTheme === "clay" 
        ? "theme-clay" 
        : "theme-default";

  const feedbackBorder = { positive: "border-l-emerald-500", warning: "border-l-amber-400", tip: "border-l-[var(--accent-color)]" };
  const skillGradients = isCute
    ? [
        "linear-gradient(90deg, #eab308, #f472b6)",
        "linear-gradient(90deg, #fbbf24, #fb7185)",
        "linear-gradient(90deg, #f59e0b, #ec4899)",
        "linear-gradient(90deg, #eab308, #fbcfe8)",
        "linear-gradient(90deg, #fbbf24, #fda4af)"
      ]
    : normalTheme === "crimson"
      ? [
          "linear-gradient(90deg, #F40000, #F44E3F)",
          "linear-gradient(90deg, #F44E3F, #F4796B)",
          "linear-gradient(90deg, #F4796B, #F4998D)",
          "linear-gradient(90deg, #F40000, #F4796B)",
          "linear-gradient(90deg, #F44E3F, #F4998D)"
        ]
      : normalTheme === "clay"
        ? [
            "linear-gradient(90deg, #628395, #96897B)",
            "linear-gradient(90deg, #96897B, #DFD5A5)",
            "linear-gradient(90deg, #DFD5A5, #DBAD6A)",
            "linear-gradient(90deg, #DBAD6A, #CF995F)",
            "linear-gradient(90deg, #628395, #CF995F)"
          ]
        : [
            "linear-gradient(90deg, #818cf8, #a78bfa)",
            "linear-gradient(90deg, #D0D2F1, #b7bce0)",
            "linear-gradient(90deg, #899878, #a3b292)",
            "linear-gradient(90deg, #3b82f6, #6366f1)",
            "linear-gradient(90deg, #D0D2F1, #899878)"
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
                          <span className="absolute -top-1 -right-1 text-[7px] animate-sparkle">✨</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[7px] font-bold text-[#2d5a37]/80 font-mono">Day {idx + 1}</span>
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
                    <div className="flex justify-between items-center text-[7px] text-[#2d5a37]/75 font-black uppercase mb-0.5">
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
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-[rgba(236,72,153,0.15)] rotate-45" />
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
      <Card className="border-border/85">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Progress</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2.5">
          {[
            {label:"Average Score",value:`${stats.average_overall_score}%`,className:accentTextClass},
            {label:"Best Score",value:`${stats.best_overall_score}%`,className:"text-emerald-600 font-bold"},
            {label:"Current Streak",value:`${stats.current_streak} days`,className:"text-amber-600 font-bold"},
            {label:"Total Sessions",value:String(stats.completed_speeches),className:"text-foreground font-bold"},
          ].map(stat=>(
            <div key={stat.label} className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">{stat.label}</span>
              <span className={`font-bold tabular-nums ${stat.className}`}>{stat.value}</span>
            </div>
          ))}
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

  return (
    <div className={`${themeRoot} h-screen flex flex-col overflow-hidden bg-background font-sans relative`}>

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
          width:"460px",
          transform:showDrawer?"translateX(0)":"translateX(100%)",
          transition:"transform 0.28s cubic-bezier(0.32,0.72,0,1), background-color 0.3s, border-color 0.3s"
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Category</Label>
                    <Select value={category} onValueChange={v=>v&&setCategory(v)}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="impromptu">Impromptu</SelectItem>
                        <SelectItem value="interview">Job Interview</SelectItem>
                        <SelectItem value="persuasive">Persuasive</SelectItem>
                        <SelectItem value="warmup">Warmup</SelectItem>
                        <SelectItem value="debate">Debate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Difficulty</Label>
                    <Select value={difficulty} onValueChange={v=>v&&setDifficulty(v)}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                    <Badge variant="secondary" className="text-[10px] uppercase shrink-0 bg-[#fef9c3] text-[#854d0e] border border-yellow-200">{difficulty}</Badge>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-3">{activeTopic.prompt}</p>
                  {activeTopic.suggested_points?.length>0&&(
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Talking Points</p>
                      <ul className="space-y-1.5">
                        {activeTopic.suggested_points.map((p,i)=>(
                          <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                            <span className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white mt-0.5 bg-[var(--accent-color)]">{i+1}</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
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
                  {recordingState==="paused"&&<p className="text-[10px] font-bold tracking-widest text-[#854d0e] mt-2">PAUSED</p>}
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

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <header className="h-14 border-b border-[var(--border-nav)] bg-[var(--bg-nav)] flex items-center justify-between px-6 flex-shrink-0 z-10 backdrop-blur-md">
        <span className="font-black text-base tracking-tight shrink-0 bg-clip-text text-transparent" style={{backgroundImage: "var(--logo-gradient)"}}>
          SpeakAI Coach
        </span>
        <div className="flex items-center gap-3">
          {!isCute && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/20 border border-border/40 px-2.5 py-1.5 rounded-lg">
              <span className="font-semibold select-none">Theme:</span>
              <select
                value={normalTheme}
                onChange={(e) => {
                  const val = e.target.value;
                  setNormalTheme(val);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("normal_theme", val);
                  }
                }}
                className="bg-transparent border-none text-foreground font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="default" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Default (Dark)</option>
                <option value="crimson" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Crimson Velvet (Dark Red)</option>
                <option value="clay" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Sunlit Clay (Light Sand)</option>
              </select>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout} disabled={logoutLoading} className="text-xs gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-all">
            <Ic.LogOut/>{logoutLoading?"...":"Sign out"}
          </Button>
        </div>
      </header>

      {/* ── Three-column body ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden z-10">

        {/* ── LEFT SIDEBAR ───────────────────────────────────────────────── */}
        <aside className="w-[260px] shrink-0 border-r border-[var(--border-sidebar)] bg-[var(--bg-sidebar)] flex flex-col overflow-hidden backdrop-blur-md">
          <div className="p-4 border-b border-[var(--border-sidebar)] flex justify-between items-center flex-shrink-0 bg-transparent">
            <span className="font-bold text-[10px] uppercase tracking-wider text-[var(--sidebar-subtext)]/80">Practice History</span>
            <span className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full bg-[var(--sidebar-active-bg)] border border-[var(--border-sidebar)] text-[var(--sidebar-active-text)]">
              {stats?.total_speeches??historyList.length} sessions
            </span>
          </div>

          {isCute && <div className="px-3 pt-2 shrink-0">{renderLeafDivider()}</div>}

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {historyError&&<p className="text-xs text-destructive p-2">{historyError}</p>}
              {!historyLoading&&historyList.length===0&&(
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  {isCute ? (
                    <div className="flex flex-col items-center gap-2 animate-bloom relative">
                      {/* Little decorative daffodils */}
                      <span className="text-xs absolute -top-1 -left-3 animate-float-leaf">🌼</span>
                      <span className="text-xs absolute -bottom-1 -right-3 animate-float-leaf" style={{ animationDelay: '1.2s' }}>🌼</span>

                      <div className="relative w-16 h-16 opacity-95 select-none pointer-events-none flex items-center justify-center">
                        <span className="text-3xl animate-float-leaf">💤</span>
                      </div>
                      <p className="text-[10px] font-extrabold text-[#2d5a37] mt-1">The garden is resting...</p>
                      <p className="text-[9px] text-[#2d5a37]/75 max-w-[180px] leading-relaxed">Practice to plant your first seed!</p>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--sidebar-subtext)] text-center py-12 px-4">No sessions yet. Start practicing.</p>
                  )}
                </div>
              )}
              {getGroupedHistory().map(group => (
                <div key={group.label} className="space-y-1.5">
                  <p className="text-[9px] font-bold tracking-wider text-[var(--sidebar-subtext)]/60 uppercase px-2">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const sel = polledSpeechId === item.id;
                      const score = item.overall_score;
                      // Determine status dot color
                      let dotClass = isCute ? "bg-amber-400" : "bg-[#899878]/80"; // Daffodil Yellow or Soft Palm Leaf green
                      if (item.status === "failed") {
                        dotClass = "bg-red-500/70"; // Soft red
                      } else if (item.status !== "completed") {
                        dotClass = "bg-[#D0D2F1] animate-pulse"; // Soft Periwinkle
                      }

                      // Hover/Active styles
                      const activeClass = sel 
                        ? "bg-[var(--sidebar-active-bg)] border-l-2 border-l-[var(--sidebar-active-border)]" 
                        : "border-l-2 border-l-transparent hover:bg-[var(--sidebar-hover-bg)]";

                      return (
                        <button key={item.id}
                          onClick={()=>{setUploadSuccess(true);setPolledSpeechId(item.id);setPolledSpeechDetails(item);}}
                          className={`w-full text-left px-2.5 py-2 rounded-md transition-all flex flex-col gap-1 ${activeClass}`}
                          style={{fontFamily:"inherit"}}>
                          <div className="flex items-center justify-between gap-2 w-full min-w-0">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} title={item.status}/>
                              <span className={`text-xs font-semibold truncate transition-colors ${sel ? "text-[var(--sidebar-active-text)]" : "text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-hover)]"}`}>
                                {item.topics?.title || "Impromptu Speech"}
                              </span>
                            </div>
                            {score !== null && (
                              <span className={`text-xs font-bold shrink-0 tabular-nums ${sel ? "text-[var(--sidebar-active-text)]" : "text-[var(--sidebar-text)]"}`}>
                                {score}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-[var(--sidebar-subtext)] pl-3.5">
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
          </ScrollArea>

          {/* Napping puppy streak card (bottom of left sidebar) */}
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

          <div className="flex-shrink-0 px-3 py-2 border-t border-[var(--border-sidebar)] flex justify-between items-center bg-transparent">
            <Button variant="ghost" size="xs" className="text-[10px] h-6 font-semibold text-[var(--sidebar-text)]/70 hover:text-[var(--sidebar-text-hover)] hover:bg-[var(--sidebar-hover-bg)]" onClick={()=>fetchHistory(historyPage-1)} disabled={historyPage===1||historyLoading}>Prev</Button>
            <span className="text-[10px] font-medium text-[var(--sidebar-subtext)]">Page {historyPage}</span>
            <Button variant="ghost" size="xs" className="text-[10px] h-6 font-semibold text-[var(--sidebar-text)]/70 hover:text-[var(--sidebar-text-hover)] hover:bg-[var(--sidebar-hover-bg)]" onClick={()=>fetchHistory(historyPage+1)} disabled={!hasMoreHistory||historyLoading}>Next</Button>
          </div>
        </aside>

        {/* ── CENTER PANEL ───────────────────────────────────────────────── */}
        <main className={`flex-1 overflow-y-auto ${isCute ? "bg-transparent" : "bg-background"}`}>

          {/* Welcome */}
          {!uploadSuccess&&(
            <div className="p-6 max-w-2xl mx-auto space-y-6 animate-bloom">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
                <div>
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
                </div>
              </div>

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
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <Label className="text-[10px] font-bold text-foreground/80">Category</Label>
                        <Select value={category} onValueChange={v=>v&&setCategory(v)}>
                          <SelectTrigger className="h-9 text-xs"><SelectValue/></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="impromptu">Impromptu</SelectItem>
                            <SelectItem value="interview">Job Interview</SelectItem>
                            <SelectItem value="persuasive">Persuasive</SelectItem>
                            <SelectItem value="warmup">Warmup</SelectItem>
                            <SelectItem value="debate">Debate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-[10px] font-bold text-foreground/80">Difficulty</Label>
                        <Select value={difficulty} onValueChange={v=>v&&setDifficulty(v)}>
                          <SelectTrigger className="h-9 text-xs"><SelectValue/></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" disabled={topicLoading} className="w-full h-9 text-xs font-bold" style={primaryBtnStyle}>
                      {topicLoading ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1.5"/>Generating...</> : "Generate Topic"}
                    </Button>
                    {topicError && <p className="text-[10px] text-destructive font-medium">{topicError}</p>}
                  </form>
                </CardContent>
              </Card>

              {isCute && renderLeafDivider()}

              {/* Active topic & Recorder inline if active */}
              {activeTopic ? (
                <div className="space-y-4 animate-bloom">
                  <Card className={`border ${accentBorderClass} ${accentBgClass} relative overflow-visible`}>
                    <CardContent className="p-4 flex gap-4 justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <p className={`font-bold text-xs leading-snug ${accentTextClass}`}>{activeTopic.title}</p>
                          <Badge variant="secondary" className="text-[8px] uppercase shrink-0 bg-[#fef9c3] text-[#854d0e] border border-yellow-200">{difficulty}</Badge>
                        </div>
                        <p className="text-xs text-foreground/80 leading-relaxed mb-3">{activeTopic.prompt}</p>
                        {activeTopic.suggested_points?.length>0&&(
                          <div>
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Talking Points</p>
                            <ul className="space-y-1.5">
                              {activeTopic.suggested_points.map((p,i)=>(
                                <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                                  <span className="shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white mt-0.5 bg-[#fb7185]">{i+1}</span>
                                  {p}
                                </li>
                              ))}
                            </ul>
                          </div>
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
                      {/* Timer */}
                      <div className="text-center">
                        <p className="text-4xl font-black tracking-tighter tabular-nums text-foreground" style={{fontFamily:"'SF Mono',monospace"}}>{ft(recordSeconds)}</p>
                        {recordingState==="recording"&&<div className="flex items-center justify-center gap-1.5 mt-1.5"><span className="rec-pulse w-2 h-2 rounded-full bg-red-500"/><span className="text-[9px] font-bold tracking-widest text-red-500">REC</span></div>}
                        {recordingState==="paused"&&<p className="text-[9px] font-bold tracking-widest text-[#854d0e] mt-1.5">PAUSED</p>}
                      </div>

                      {/* Waveform */}
                      {recordingState==="recording"&&(
                        <div className="h-8 flex items-center justify-center gap-[2px] overflow-hidden">
                          {Array.from({length:32}).map((_,i)=>{
                            const hs=[8,14,20,10,24,16,12,28,18,10,22,16,8,20,14,26,12,18,10,24,16,8,20,14,28,12,18,10,22,16,8,20];
                            return <div key={i} className={`w-[2.5px] rounded-sm 
                              ${isCute ? (i % 2 === 0 ? "bg-[#eab308]" : "bg-[#568764]") : "bg-indigo-500"}`} 
                              style={{height:`${hs[i%hs.length]}px`,animation:`recPulse ${0.8+i*0.04}s ease-in-out infinite`,animationDelay:`${i*0.03}s`}}/>;
                          })}
                        </div>
                      )}

                      {/* Controls */}
                      {recordingState==="idle"&&(
                        <Button onClick={startRecording} className="w-full h-9 gap-1.5 font-bold text-xs" style={primaryBtnStyle}><Ic.Mic/>Start Recording</Button>
                      )}
                      {recordingState==="recording"&&(
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={pauseRecording} className="flex-1 h-9 text-xs">Pause</Button>
                          <Button variant="destructive" onClick={()=>stopStream()} className="flex-1 h-9 text-xs">Stop</Button>
                        </div>
                      )}
                      {recordingState==="paused"&&(
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={resumeRecording} className={`flex-1 h-9 text-xs ${accentBorderClass} ${accentTextClass}`}>Resume</Button>
                          <Button variant="destructive" onClick={()=>stopStream()} className="flex-1 h-9 text-xs">Stop</Button>
                        </div>
                      )}
                      {recordingState==="stopped"&&(
                        <div className="flex flex-col gap-3.5">
                          <div className="rounded-lg border border-border bg-muted/40 p-2.5">
                            <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                              <span className="font-medium text-foreground">Duration: {ft(recordSeconds)}</span>
                              {audioBlob&&<span>{(audioBlob.size/1048576).toFixed(2)} MB</span>}
                            </div>
                            <audio src={audioUrl||""} controls className="w-full h-8 rounded"/>
                          </div>
                          {recordSeconds<10&&<p className="text-[10px] text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-2.5 py-1.5 font-semibold">Speech must be at least 10 seconds long.</p>}
                          {uploadError&&<p className="text-[10px] text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-2.5 py-1.5 font-semibold">{uploadError}</p>}
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
            </div>
          )}

          {/* Processing */}
          {isProcessing&&(
            <div className="flex flex-col items-center justify-center h-full gap-4">
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
                  <Button variant="outline" onClick={() => { setTopics([]); setShowDrawer(true); }} className="gap-1.5 text-xs h-9">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    New Topic
                  </Button>
                  <Button onClick={()=>setShowDrawer(true)} className="gap-2 shrink-0" style={primaryBtnStyle}><Ic.Mic/>Practice Again</Button>
                </div>
              </div>
              <Card className="border-destructive/30 bg-destructive/5 text-center">
                <CardContent className="pt-6 pb-6">
                  <p className="font-bold text-destructive mb-2">Evaluation Failed</p>
                  <p className="text-sm text-destructive/80 leading-relaxed mb-4">We couldn&apos;t transcribe or evaluate this recording. Please check your microphone and try again.</p>
                  <Button variant="destructive" onClick={()=>{discardSpeechAndReset();setShowDrawer(true);}}>Retry Recording</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Completed */}
          {isCompleted&&speech&&(
            <div className="p-8 max-w-3xl">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
                <span>History</span><Ic.Chevron/><span className="text-foreground font-medium">{speech.topics?.title||"Impromptu Speech"}</span>
              </div>

              {/* Header */}
              <div className="flex justify-between items-start mb-6 gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl font-black text-foreground tracking-tight mb-1">{speech.topics?.title||"Impromptu Speech"}</h1>
                  <p className="text-sm text-muted-foreground">Recorded {fLong(speech.created_at)} · {fd(speech.duration_seconds)} duration</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" onClick={() => { setTopics([]); setShowDrawer(true); }} className="gap-1.5 text-xs h-9">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    New Topic
                  </Button>
                  <Button onClick={()=>setShowDrawer(true)} className="gap-2 shrink-0" style={primaryBtnStyle}><Ic.Mic/>Practice Again</Button>
                </div>
              </div>

              {/* Score */}
              {speech.overall_score!==null&&(
                <Card className={`mb-4 overflow-hidden border-border/85 bg-gradient-to-r from-card to-muted/5 relative ${isCute ? "hover:border-[#fbbf24]/50" : ""}`}>
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

              {/* Skill breakdown */}
              <Card className="mb-4 border-border/85">
                <CardHeader className="pb-3 pt-4 px-5">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skill Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-4.5">
                  {[
                    {label:"Clarity & Enunciation",score:speech.pronunciation_score,color:skillGradients[0]},
                    {label:"Pacing & Pauses",score:speech.fluency_score,color:skillGradients[1]},
                    {label:"Grammar & Accuracy",score:speech.grammar_score,color:skillGradients[2]},
                    {label:"Content & Structure",score:speech.content_score,color:skillGradients[3]},
                    ...(speech.lexicon_score!=null?[{label:"Vocabulary & Lexicon",score:speech.lexicon_score,color:skillGradients[4]}]:[]),
                  ].map((skill,idx)=>skill.score!=null&&(
                    <div key={skill.label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-foreground/80">{skill.label}</span>
                        <span className="text-xs font-bold text-foreground tabular-nums">{skill.score}/100</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{width:`${skill.score}%`,background:skill.color}}/>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Transcript */}
              {speech.transcript&&(
                <Card className="border-border/85">
                  <CardHeader className="pb-3 pt-4 px-5 flex flex-row justify-between items-center space-y-0">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Spoken Transcript</CardTitle>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
                          <span className="text-[10px] font-semibold text-red-500">Filler words highlighted</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Suggested to take a break</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"/>
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Avoid taking break</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="xs" onClick={()=>{if(speech.transcript){const cleanText=speech.transcript.replace(/\[suggest break\]|\[do not break\]/gi, "").replace(/\s+/g, " ");navigator.clipboard.writeText(cleanText);setCopied(true);setTimeout(()=>setCopied(false),2000);}}} className="text-[10px] h-6 px-2 gap-1 text-muted-foreground hover:text-foreground">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div className="p-4 rounded-lg border border-border/60 bg-muted/20">
                      <p 
                        onDoubleClick={handleTextDoubleClick}
                        className="text-xs leading-relaxed text-foreground/80 font-normal whitespace-pre-wrap cursor-pointer select-text"
                      >
                        {highlightTranscript(speech.transcript)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Debate challenge */}
              {counterArgument && (
                <Card className="mt-4 border-amber-200/85 bg-amber-50/20 dark:bg-amber-950/10 dark:border-amber-500/20 shadow-sm">
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

              <div className="mt-5 text-center">
                <Button variant="outline" onClick={()=>{discardSpeechAndReset();setShowDrawer(true);}}>Practice Another Topic</Button>
              </div>
            </div>
          )}
        </main>

        {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
        {((isCompleted && speech) || isCute) && (
          <aside className="w-[280px] shrink-0 border-l border-[var(--border-sidebar)] bg-[var(--bg-sidebar)] flex flex-col overflow-hidden backdrop-blur-md">
            {/* Tab Switcher */}
            {isCompleted && speech ? (
              <div className="p-3 border-b border-border flex-shrink-0 bg-muted/5">
                <div className="flex p-0.5 rounded-lg bg-muted/60 text-xs">
                  {(["feedback", "vocab", "progress"] as const).map((tab) => {
                    const active = rightTab === tab;
                    const label = tab === "feedback" ? "Feedback" : tab === "vocab" ? "Vocab" : "Progress";
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
            ) : (
              <div className="p-4 border-b border-[var(--border-sidebar)] flex justify-between items-center bg-transparent flex-shrink-0">
                <span className="font-bold text-[10px] uppercase tracking-wider text-[var(--sidebar-subtext)]/80">Gardening Stats</span>
              </div>
            )}

            {isCute && <div className="px-4 shrink-0">{renderLeafDivider()}</div>}

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isCompleted && speech ? (
                <>
                  {rightTab === "feedback" && (
                    <>
                      {/* Coach Feedback */}
                      {coachFeedback.length>0&&(
                        <Card className="border-border/85 bg-gradient-to-b from-card to-muted/5">
                          <CardHeader className="pb-3 pt-4 px-4">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Coach Feedback</CardTitle>
                          </CardHeader>
                          <CardContent className="px-4 pb-4 space-y-3.5">
                            {coachFeedback.map((item,i)=>(
                              <div key={i} className="flex gap-2.5 items-start">
                                {item.type === "positive" && (
                                  <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                )}
                                {item.type === "warning" && (
                                  <svg className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                                )}
                                {item.type === "tip" && (
                                  <svg className="w-3.5 h-3.5 text-[var(--accent-color)] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-foreground/95 leading-tight">{item.title}</p>
                                  <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">{item.body}</p>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                    </>
                  )}

                  {rightTab === "vocab" && (
                    <>
                      {/* Vocabulary upgrades */}
                      {lexiconSuggestions.length>0 ? (
                        <Card className="border-border/85 bg-gradient-to-b from-card to-muted/5">
                          <CardHeader className="pb-3 pt-4 px-4">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vocabulary Upgrades</CardTitle>
                          </CardHeader>
                          <CardContent className="px-4 pb-4 space-y-3">
                            {lexiconSuggestions.slice(0,4).map((s,i)=>(
                              <div key={i} className={`border rounded-lg p-2.5 space-y-1.5 transition-all
                                ${isCute 
                                  ? "border-[rgba(21,46,27,0.08)] bg-white/40 hover:border-[#eab308]/40 hover:-translate-y-0.5" 
                                  : "border-border/70 bg-muted/10 hover:border-border"
                                }`}
                              >
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] line-through text-muted-foreground/80 bg-muted px-1.5 py-0.5 rounded font-medium">
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
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="text-center py-8 text-xs text-muted-foreground">
                          No vocabulary suggestions for this session.
                        </div>
                      )}
                    </>
                  )}

                  {rightTab === "progress" && (
                    <>
                      {isCute ? renderCuteProgress() : renderDefaultProgress()}
                      <AdBanner placement="analytics-footer" hidden={shouldHideAds} />
                    </>
                  )}
                </>
              ) : (
                /* Default to progress tab content if no speech active */
                <>
                  {renderCuteProgress()}
                  <AdBanner placement="analytics-footer" hidden={shouldHideAds} />
                </>
              )}
            </div>


          </aside>
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
