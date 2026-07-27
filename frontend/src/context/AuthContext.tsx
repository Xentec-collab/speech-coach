"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session, SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { getApiBaseUrl } from "@/lib/api";

export interface UserProfile {
  email: string | null;
  is_superuser: boolean;
  plan: string;
  is_cute_mode: boolean;
}

export interface AdConfig {
  ads_enabled: boolean;
  provider: string;
  placements: string[];
  is_superuser?: boolean;
  plan?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  supabase: SupabaseClient | null;
  error: string | null;
  profile: UserProfile | null;
  adConfig: AdConfig | null;
  refreshProfile: () => Promise<void>;
  refreshAdConfig: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  supabase: null,
  error: null,
  profile: null,
  adConfig: null,
  refreshProfile: async () => {},
  refreshAdConfig: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [adConfig, setAdConfig] = useState<AdConfig | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [adConfigLoading, setAdConfigLoading] = useState(false);

  const fetchProfile = useCallback(async (token: string) => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        setProfile({
          email: user?.email || "",
          is_superuser: false,
          plan: "free",
          is_cute_mode: false
        });
      }
    } catch {
      setProfile({
        email: user?.email || "",
        is_superuser: false,
        plan: "free",
        is_cute_mode: false
      });
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  const fetchAdConfig = useCallback(async (token?: string) => {
    try {
      const baseUrl = getApiBaseUrl();
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${baseUrl}/api/monetization/config`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAdConfig(data);
      } else {
        setAdConfig({
          ads_enabled: true,
          provider: "placeholder",
          placements: ["sidebar", "analytics-footer"]
        });
      }
    } catch {
      setAdConfig({
        ads_enabled: true,
        provider: "placeholder",
        placements: ["sidebar", "analytics-footer"]
      });
    } finally {
      setAdConfigLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.access_token) {
      await fetchProfile(session.access_token);
    }
  }, [session, fetchProfile]);

  const refreshAdConfig = useCallback(async () => {
    await fetchAdConfig(session?.access_token);
  }, [session, fetchAdConfig]);

  useEffect(() => {
    try {
      const client = createSupabaseBrowserClient();
      setSupabase(client);

      // Get initial session
      client.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }).catch((err) => {
        setError(err.message || "Failed to retrieve session.");
        setLoading(false);
      });

      // Listen for auth changes
      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (err: any) {
      setError(err.message || "Configuration error.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      setProfileLoading(true);
      setAdConfigLoading(true);
      fetchProfile(session.access_token);
      fetchAdConfig(session.access_token);
    } else if (!loading) {
      setAdConfigLoading(true);
      setProfile(null);
      fetchAdConfig();
    }
  }, [session, loading, fetchProfile, fetchAdConfig]);

  if (error && error.includes("Supabase frontend environment variables are not configured")) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-red-100 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Supabase Configuration Required</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            It looks like your Supabase environment variables are missing or empty in your <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-red-600">frontend/.env.local</code> file.
          </p>
          <div className="text-left bg-slate-900 rounded-lg p-4 text-xs font-mono text-slate-300 overflow-x-auto mb-6">
            <p className="text-emerald-400"># frontend/.env.local</p>
            <p>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</p>
          </div>
          <p className="text-xs text-slate-400">
            Please configure these values and restart your Next.js dev server.
          </p>
        </div>
      </div>
    );
  }

  const contextLoading = loading || profileLoading || adConfigLoading;

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading: contextLoading, 
      supabase, 
      error,
      profile,
      adConfig,
      refreshProfile,
      refreshAdConfig
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
