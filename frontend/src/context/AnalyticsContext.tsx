"use client";

import React, { createContext, useContext, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getApiBaseUrl } from "@/lib/api";

export interface AnalyticsEvent {
  event_type: "page_view" | "tab_switch" | "feature_use" | "action" | "session_end";
  event_name: string;
  session_id: string;
  page_path?: string;
  referrer?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

interface AnalyticsContextType {
  trackEvent: (eventName: string, metadata?: Record<string, any>, eventType?: AnalyticsEvent["event_type"]) => void;
  trackTabSwitch: (tabName: string) => void;
  trackFeatureStart: (featureName: string) => void;
  trackFeatureEnd: (featureName: string) => void;
  sessionId: string;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  trackEvent: () => {},
  trackTabSwitch: () => {},
  trackFeatureStart: () => {},
  trackFeatureEnd: () => {},
  sessionId: "",
});

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const pathname = usePathname();

  // 1. Session ID (Persists for current tab session)
  const sessionIdRef = useRef<string>("");
  if (!sessionIdRef.current && typeof window !== "undefined") {
    let stored = sessionStorage.getItem("speakai_session_id");
    if (!stored) {
      stored = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem("speakai_session_id", stored);
    }
    sessionIdRef.current = stored;
  }

  // Session metadata
  const sessionStartTimeRef = useRef<number>(Date.now());
  const currentFeatureRef = useRef<string>("console");
  const featureStartTimeRef = useRef<number>(Date.now());
  const pageCountRef = useRef<number>(1);

  // In-memory event batch queue
  const queueRef = useRef<AnalyticsEvent[]>([]);

  // ── Flush Queue to Backend ──────────────────────────────────────────────────
  const flushQueue = useCallback(async () => {
    if (queueRef.current.length === 0) return;

    const eventsToSend = [...queueRef.current];
    queueRef.current = [];

    try {
      const baseUrl = getApiBaseUrl();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      await fetch(`${baseUrl}/api/analytics/events`, {
        method: "POST",
        headers,
        body: JSON.stringify({ events: eventsToSend }),
      });
    } catch (err) {
      // In case of transient failure, put events back (capped at 50 to prevent overflow)
      queueRef.current = [...eventsToSend.slice(-25), ...queueRef.current].slice(-50);
    }
  }, [session?.access_token]);

  // ── Push Event to Queue ─────────────────────────────────────────────────────
  const trackEvent = useCallback((
    eventName: string,
    metadata?: Record<string, any>,
    eventType: AnalyticsEvent["event_type"] = "action"
  ) => {
    const ev: AnalyticsEvent = {
      event_type: eventType,
      event_name: eventName,
      session_id: sessionIdRef.current,
      page_path: typeof window !== "undefined" ? window.location.pathname : pathname,
      referrer: typeof document !== "undefined" ? document.referrer : "",
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    };

    queueRef.current.push(ev);
  }, [pathname]);

  // ── Feature Timing Helpers ──────────────────────────────────────────────────
  const trackFeatureStart = useCallback((featureName: string) => {
    currentFeatureRef.current = featureName;
    featureStartTimeRef.current = Date.now();
  }, []);

  const trackFeatureEnd = useCallback((featureName: string) => {
    const duration = Date.now() - featureStartTimeRef.current;
    trackEvent(featureName, { duration_ms: duration }, "feature_use");
  }, [trackEvent]);

  // ── Tab Switch Helper ───────────────────────────────────────────────────────
  const trackTabSwitch = useCallback((tabName: string) => {
    // End previous feature timer
    if (currentFeatureRef.current && currentFeatureRef.current !== tabName) {
      const duration = Date.now() - featureStartTimeRef.current;
      trackEvent(currentFeatureRef.current, { duration_ms: duration }, "feature_use");
    }

    currentFeatureRef.current = tabName;
    featureStartTimeRef.current = Date.now();

    trackEvent(tabName, { switch_time: new Date().toISOString() }, "tab_switch");
  }, [trackEvent]);

  // ── 5-Second Interval Batch Flush ───────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      flushQueue();
    }, 5000);

    return () => clearInterval(interval);
  }, [flushQueue]);

  // ── Auto-track Route Changes ────────────────────────────────────────────────
  useEffect(() => {
    if (pathname) {
      pageCountRef.current += 1;
      trackEvent(pathname, {}, "page_view");
    }
  }, [pathname, trackEvent]);

  // ── Beacon Exit Tracker on Tab Close / Unload ───────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = () => {
      const totalDurationSec = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
      const baseUrl = getApiBaseUrl();

      // 1. Send session end summary via beacon
      const endPayload = {
        session_id: sessionIdRef.current,
        exit_page: window.location.pathname,
        exit_feature: currentFeatureRef.current,
        total_duration_s: totalDurationSec,
        page_count: pageCountRef.current,
      };

      try {
        const blob = new Blob([JSON.stringify(endPayload)], { type: "application/json" });
        navigator.sendBeacon(`${baseUrl}/api/analytics/session-end`, blob);
      } catch (e) {
        // Beacon fallback
      }

      // 2. Flush any remaining events
      if (queueRef.current.length > 0) {
        try {
          const eventsBlob = new Blob(
            [JSON.stringify({ events: queueRef.current })],
            { type: "application/json" }
          );
          navigator.sendBeacon(`${baseUrl}/api/analytics/events`, eventsBlob);
        } catch (e) {}
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <AnalyticsContext.Provider
      value={{
        trackEvent,
        trackTabSwitch,
        trackFeatureStart,
        trackFeatureEnd,
        sessionId: sessionIdRef.current,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => useContext(AnalyticsContext);
