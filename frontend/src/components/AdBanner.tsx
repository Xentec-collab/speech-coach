import React from "react";
import { useAuth } from "@/context/AuthContext";

interface AdBannerProps {
  placement: "sidebar" | "analytics-footer";
  hidden?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({ placement, hidden = false }) => {
  const { profile, adConfig } = useAuth();

  if (hidden || !profile || !adConfig) return null;

  // Safety checks: hide if user is superuser or on premium tiers
  if (profile.is_superuser || adConfig.is_superuser) return null;
  if (profile.plan === "superuser" || adConfig.plan === "superuser") return null;
  if (profile.plan === "pro" || profile.plan === "pro_plus") return null;

  // Check if ads are globally enabled and this placement is active
  if (!adConfig.ads_enabled) return null;
  if (!adConfig.placements || !adConfig.placements.includes(placement)) return null;

  // Detect Cute Mode from local storage or context properties
  const isCute = typeof window !== "undefined" && localStorage.getItem("is_cute_mode") === "true";

  // Build styles adapting dynamically to current active page theme
  const containerClasses = isCute
    ? "rounded-2xl border border-[rgba(236,72,153,0.15)] bg-white/40 backdrop-blur-md p-3.5 relative overflow-hidden text-center shadow-xs"
    : "rounded-xl border border-border/80 bg-card p-4 relative overflow-hidden text-center shadow-xs";

  const badgeClasses = isCute
    ? "inline-block text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-pink-100/70 text-pink-600 border border-pink-200/50 mb-1.5"
    : "inline-block text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/40 mb-2";

  const titleClasses = isCute
    ? "text-[10px] font-extrabold text-[#2d5a37] tracking-tight"
    : "text-xs font-bold text-foreground";

  const descClasses = isCute
    ? "text-[9px] text-[#2d5a37]/75 mt-1 leading-normal max-w-[200px] mx-auto"
    : "text-[10px] text-muted-foreground/80 mt-1 leading-normal max-w-[220px] mx-auto";

  return (
    <div className={`${containerClasses} w-full select-none mt-2 mb-2`}>
      {isCute && (
        <div className="absolute top-0 right-0 w-8 h-8 bg-pink-100/20 rounded-bl-full pointer-events-none" />
      )}
      <div className="flex flex-col items-center justify-center">
        <span className={badgeClasses}>Sponsored</span>
        <p className={titleClasses}>Sponsored Content</p>
        <p className={descClasses}>
          This area is reserved for future advertisements.
        </p>
      </div>
    </div>
  );
};
