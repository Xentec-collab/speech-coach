"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getApiBaseUrl } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Activity,
  Clock,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Flame,
  FileText,
  Mic,
  BookOpen,
  Bot,
  Layers,
  Sparkles
} from "lucide-react";

interface AnalyticsOverview {
  total_users: number;
  new_users_7d: number;
  returning_users: number;
  lost_users_14d: number;
  total_sessions: number;
  total_events: number;
}

interface FeatureStat {
  feature: string;
  usage_count: number;
  percentage: number;
  avg_time_spent_seconds: number;
}

interface ExitPageStat {
  page: string;
  feature: string;
  exit_count: number;
  exit_rate_percentage: number;
  avg_session_seconds: number;
}

interface DailyTrend {
  date: string;
  active_users: number;
  events: number;
}

interface TrackedUser {
  user_id: string;
  event_count: number;
  last_active: string;
  first_active: string;
  last_feature: string;
}

interface JourneyEvent {
  id: string;
  event_type: string;
  event_name: string;
  page_path: string;
  metadata: Record<string, any>;
  created_at: string;
}

export function AnalyticsDashboard() {
  const { session, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [features, setFeatures] = useState<FeatureStat[]>([]);
  const [exitPages, setExitPages] = useState<ExitPageStat[]>([]);
  const [dailyTrends, setDailyTrends] = useState<DailyTrend[]>([]);
  const [usersList, setUsersList] = useState<TrackedUser[]>([]);

  // User Journey explorer
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [journeyEvents, setJourneyEvents] = useState<JourneyEvent[]>([]);
  const [journeyLoading, setJourneyLoading] = useState(false);

  const fetchAnalyticsData = useCallback(async () => {
    if (!session?.access_token) return;
    setError(null);
    try {
      const baseUrl = getApiBaseUrl();
      const headers = {
        Authorization: `Bearer ${session.access_token}`,
      };

      const [ovRes, featRes, exitRes, dauRes, usersRes] = await Promise.all([
        fetch(`${baseUrl}/api/analytics/overview`, { headers }),
        fetch(`${baseUrl}/api/analytics/features`, { headers }),
        fetch(`${baseUrl}/api/analytics/exit-pages`, { headers }),
        fetch(`${baseUrl}/api/analytics/daily-active`, { headers }),
        fetch(`${baseUrl}/api/analytics/users`, { headers }),
      ]);

      if (!ovRes.ok) throw new Error("Failed to fetch overview metrics");

      const [ovData, featData, exitData, dauData, usersData] = await Promise.all([
        ovRes.json(),
        featRes.json(),
        exitRes.json(),
        dauRes.json(),
        usersRes.json(),
      ]);

      setOverview(ovData);
      setFeatures(featData || []);
      setExitPages(exitData || []);
      setDailyTrends(dauData || []);
      setUsersList(usersData || []);

      if (usersData && usersData.length > 0 && !selectedUserId) {
        setSelectedUserId(usersData[0].user_id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load telemetry data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.access_token, selectedUserId]);

  const fetchUserJourney = useCallback(async (userId: string) => {
    if (!session?.access_token || !userId) return;
    setJourneyLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/analytics/user-journey/${userId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setJourneyEvents(data || []);
      }
    } catch (err) {
      console.error("Error fetching user journey:", err);
    } finally {
      setJourneyLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserJourney(selectedUserId);
    }
  }, [selectedUserId, fetchUserJourney]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  const getFeatureIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "console":
      case "speech_upload":
      case "topic_generate":
        return <Mic className="w-4 h-4 text-emerald-500" />;
      case "tracks":
      case "interview_start":
        return <Layers className="w-4 h-4 text-blue-500" />;
      case "library":
      case "article_completed":
        return <BookOpen className="w-4 h-4 text-purple-500" />;
      case "coach":
      case "coach_viewed":
        return <Bot className="w-4 h-4 text-amber-500" />;
      default:
        return <Activity className="w-4 h-4 text-zinc-400" />;
    }
  };

  const formatSeconds = (sec: number) => {
    if (!sec || sec <= 0) return "0s";
    if (sec < 60) return `${Math.round(sec)}s`;
    const mins = Math.floor(sec / 60);
    const remainingSec = Math.round(sec % 60);
    return `${mins}m ${remainingSec}s`;
  };

  const formatTimestamp = (iso: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
        " • " +
        d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return iso;
    }
  };

  if (!profile?.is_superuser) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-lg font-bold">Access Restricted</h2>
        <p className="text-xs text-muted-foreground">
          Analytics dashboard is reserved exclusively for system superusers.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  const filteredUsers = usersList.filter((u) =>
    u.user_id.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── Top Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Activity className="w-6 h-6 text-[var(--accent-color)]" />
              Platform Telemetry & Analytics
            </h1>
            <Badge variant="outline" className="text-[10px] uppercase font-bold border-amber-500/40 text-amber-500 bg-amber-500/10">
              Superuser Only
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time feature usage, session duration, user journeys, and exit tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-xl text-xs font-semibold h-9 px-3 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
          {error}
        </div>
      )}

      {/* ── 1. KPI Overview Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Users</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {overview?.total_users || 0}
              </h3>
              <p className="text-[10px] text-muted-foreground">{overview?.total_sessions || 0} total sessions logged</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* New Users (7d) */}
        <Card className="rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">New Users (7 Days)</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-500">
                {overview?.new_users_7d || 0}
              </h3>
              <p className="text-[10px] text-muted-foreground">Joined in the last 7 days</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <UserPlus className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Returning Users */}
        <Card className="rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Returning Users</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-purple-500">
                {overview?.returning_users || 0}
              </h3>
              <p className="text-[10px] text-muted-foreground">Active repeat users</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <UserCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Lost / Churned Users (14d+) */}
        <Card className="rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Lost Users (14d+)</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-500">
                {overview?.lost_users_14d || 0}
              </h3>
              <p className="text-[10px] text-muted-foreground">Inactive for 14+ days</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <UserX className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 2. Feature Usage & Time Spent ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Features */}
        <Card className="rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Most Used Features
            </CardTitle>
            <CardDescription className="text-xs">Ranked by total interaction events</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3.5">
            {features.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">No feature interactions recorded yet.</p>
            ) : (
              features.map((f, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold capitalize">
                      {getFeatureIcon(f.feature)}
                      <span>{f.feature.replace("_", " ")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-foreground tabular-nums">{f.usage_count} uses</span>
                      <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0 h-4">
                        {f.percentage}%
                      </Badge>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-[var(--accent-color)] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(f.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Time Spent Per Feature */}
        <Card className="rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Average Time Spent Per Feature
            </CardTitle>
            <CardDescription className="text-xs">Active session time spent on each tab/tool</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3.5">
            {features.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">No duration metrics recorded yet.</p>
            ) : (
              features.map((f, idx) => {
                const maxSec = Math.max(...features.map((x) => x.avg_time_spent_seconds || 1));
                const barWidth = Math.min(100, Math.max(8, (f.avg_time_spent_seconds / maxSec) * 100));

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold capitalize">
                        {getFeatureIcon(f.feature)}
                        <span>{f.feature.replace("_", " ")}</span>
                      </div>
                      <span className="font-bold text-foreground tabular-nums">
                        {formatSeconds(f.avg_time_spent_seconds)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Exit Pages & 30-Day DAU Trend ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exit Pages Table */}
        <Card className="rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <LogOut className="w-4 h-4 text-rose-500" />
              Last Page & Feature Closed (Exit Points)
            </CardTitle>
            <CardDescription className="text-xs">Where users leave or close their browser tab</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {exitPages.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">No exit data recorded yet.</p>
            ) : (
              <div className="space-y-2.5">
                {exitPages.slice(0, 5).map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-border/40 bg-background/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-bold text-foreground truncate">{ex.page}</p>
                      <p className="text-[10px] text-muted-foreground capitalize flex items-center gap-1">
                        <span>Tab: {ex.feature}</span>
                        <span>•</span>
                        <span>Avg session: {formatSeconds(ex.avg_session_seconds)}</span>
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant="outline" className="text-[10px] font-bold text-rose-500 border-rose-500/30 bg-rose-500/10">
                        {ex.exit_count} exits ({ex.exit_rate_percentage}%)
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 30-Day DAU Trend (SVG Line/Area Chart) */}
        <Card className="rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Daily Active Users (Last 30 Days)
            </CardTitle>
            <CardDescription className="text-xs">Trend of active unique visitors</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 flex flex-col justify-between">
            {dailyTrends.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">No daily active trend data yet.</p>
            ) : (
              <div className="space-y-4">
                <div className="h-44 w-full flex items-end gap-1 pt-4 px-1">
                  {dailyTrends.map((d, i) => {
                    const maxActive = Math.max(...dailyTrends.map((t) => t.active_users || 1));
                    const heightPercent = Math.min(100, Math.max(10, (d.active_users / maxActive) * 100));

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                          className="w-full bg-gradient-to-t from-[var(--accent-color)]/50 to-[var(--accent-color)] rounded-t-sm transition-all duration-300 hover:brightness-125"
                          style={{ height: `${heightPercent}%` }}
                        />
                        {/* Tooltip on hover */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-[10px] font-bold px-2 py-1 rounded shadow pointer-events-none whitespace-nowrap z-10 border border-border">
                          {d.date}: {d.active_users} users ({d.events} events)
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold px-1">
                  <span>{dailyTrends[0]?.date || "30 days ago"}</span>
                  <span>{dailyTrends[Math.floor(dailyTrends.length / 2)]?.date || "15 days ago"}</span>
                  <span>{dailyTrends[dailyTrends.length - 1]?.date || "Today"}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── 4. User Journey Timeline Explorer ──────────────────────────────────── */}
      <Card className="rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="p-5 pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-500" />
                User Journey Timeline (Individual Audit)
              </CardTitle>
              <CardDescription className="text-xs">
                Select any user to view their chronological event journey log
              </CardDescription>
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search User ID..."
                className="w-full h-8 px-3 text-xs bg-background/70 border border-border/60 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 grid grid-cols-1 lg:grid-cols-3 min-h-[380px]">
          {/* User selector list */}
          <div className="border-r border-border/40 p-3 space-y-2 max-h-[420px] overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground p-4 text-center">No tracked users found.</p>
            ) : (
              filteredUsers.map((u) => (
                <button
                  key={u.user_id}
                  onClick={() => setSelectedUserId(u.user_id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs space-y-1 ${
                    selectedUserId === u.user_id
                      ? "bg-primary/10 border-primary/40 text-foreground font-semibold shadow-sm"
                      : "bg-background/40 border-border/30 text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] truncate max-w-[170px]">{u.user_id}</span>
                    <Badge variant="secondary" className="text-[9px] h-4 px-1 font-bold">
                      {u.event_count} events
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Last: {u.last_feature}</span>
                    <span>{formatTimestamp(u.last_active).split("•")[0]}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* User Event Timeline */}
          <div className="lg:col-span-2 p-5 max-h-[420px] overflow-y-auto">
            {journeyLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : !selectedUserId ? (
              <div className="text-center py-16 text-muted-foreground text-xs">
                Select a user from the left column to view their event timeline.
              </div>
            ) : journeyEvents.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-xs">
                No events recorded for this user yet.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/30 text-xs">
                  <span className="font-bold text-foreground">
                    Chronological Event Stream ({journeyEvents.length} actions)
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">{selectedUserId}</span>
                </div>

                <div className="space-y-2.5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                  {journeyEvents.map((ev) => (
                    <div key={ev.id} className="relative flex items-start gap-3.5 pl-6 text-xs">
                      {/* Timeline dot */}
                      <span className="absolute left-[9px] top-1.5 w-2 h-2 rounded-full bg-[var(--accent-color)] ring-4 ring-background" />

                      <div className="flex-1 p-3 rounded-xl border border-border/40 bg-background/50 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-bold text-foreground capitalize">
                            {getFeatureIcon(ev.event_name)}
                            <span>{ev.event_name.replace("_", " ")}</span>
                            <Badge variant="outline" className="text-[9px] h-4 px-1 font-semibold uppercase">
                              {ev.event_type}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            {formatTimestamp(ev.created_at)}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <span>Path: {ev.page_path}</span>
                          {ev.metadata?.duration_ms && (
                            <>
                              <span>•</span>
                              <span>Duration: {formatSeconds(ev.metadata.duration_ms / 1000)}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
