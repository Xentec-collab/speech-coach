import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface RewardedAdProps {
  onAdWatched: () => void;
  onAdFailed?: (err: string) => void;
}

export const RewardedAd: React.FC<RewardedAdProps> = ({ onAdWatched, onAdFailed }) => {
  const [loading, setLoading] = useState(false);

  const handleWatchAd = async () => {
    setLoading(true);
    try {
      // Simulate watching a rewarded ad video (e.g. 2.5 seconds delay)
      await new Promise((resolve) => setTimeout(resolve, 2500));
      onAdWatched();
    } catch (err: any) {
      if (onAdFailed) {
        onAdFailed(err.message || "Failed to load rewarded ad.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl bg-card border-border/80 text-center space-y-3">
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-foreground">Need more sessions?</h4>
        <p className="text-[10px] text-muted-foreground">
          Watch a quick sponsored video to get +1 extra coaching session!
        </p>
      </div>
      <Button
        size="xs"
        onClick={handleWatchAd}
        disabled={loading}
        className="w-full text-[10px] font-bold"
      >
        {loading ? "Loading Video..." : "Watch Video (+1 Session)"}
      </Button>
    </div>
  );
};
