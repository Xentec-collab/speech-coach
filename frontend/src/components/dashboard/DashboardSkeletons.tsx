import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function SidebarHistorySkeleton() {
  return (
    <div className="space-y-4 px-1 py-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-3 rounded-xl border border-border/40 bg-card/30 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PracticeConsoleSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-border/50 bg-card/40 space-y-3">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Topic Generator Form Skeleton */}
      <div className="p-6 rounded-2xl border border-border/50 bg-card/40 space-y-4">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="flex justify-end">
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* Audio Recorder Panel Skeleton */}
      <div className="p-8 rounded-2xl border border-border/50 bg-card/40 text-center space-y-4 flex flex-col items-center justify-center">
        <Skeleton className="h-12 w-32 rounded-full" />
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function InterviewTracksSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">
      {/* Track Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-border/50 bg-card/40 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Pathways Selection */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl border border-border/50 bg-card/40 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap Stages */}
      <div className="space-y-3 pt-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-border/50 bg-card/40 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3.5 w-64 max-w-full" />
              </div>
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function KnowledgeLibrarySkeleton() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">
      {/* Search & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-full sm:w-72 rounded-xl" />
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* Recommended Banner */}
      <div className="p-5 rounded-2xl border border-border/50 bg-card/40 space-y-3">
        <Skeleton className="h-5 w-44" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-border/30 bg-background/50 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
            </div>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-border/50 bg-card/40 space-y-3">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
            <div className="pt-2 flex justify-between items-center">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AICoachSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">
      {/* Assessment Header Card */}
      <div className="p-6 rounded-2xl border border-border/50 bg-card/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <Skeleton className="h-20 w-20 rounded-2xl flex-shrink-0" />
      </div>

      {/* Key Skill Highlights (3 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-border/50 bg-card/40 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-3.5 w-full" />
          </div>
        ))}
      </div>

      {/* Growth Trends & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-border/50 bg-card/40 space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="h-44 flex items-end justify-between gap-2 pt-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="w-full rounded-t-lg" style={{ height: `${30 + (i * 10) % 60}%` }} />
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border/50 bg-card/40 space-y-4">
          <Skeleton className="h-5 w-48" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 rounded-xl border border-border/30 bg-background/50 space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-3/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SpeechEvaluationSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Main Left Column (2 cols) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Title & Radial Gauge Card */}
        <div className="p-6 rounded-2xl border border-border/50 bg-card/40 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-28 w-28 rounded-full flex-shrink-0" />
        </div>

        {/* Spoken Transcript Card */}
        <div className="p-6 rounded-2xl border border-border/50 bg-card/40 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <div className="space-y-2.5 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-9/12" />
          </div>
        </div>
      </div>

      {/* Right Column (1 col) */}
      <div className="space-y-6">
        <div className="p-6 rounded-2xl border border-border/50 bg-card/40 space-y-4">
          <Skeleton className="h-6 w-36" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 rounded-xl border border-border/30 bg-background/40 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3.5 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function FullDashboardLayoutSkeleton() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left Sidebar Skeleton */}
      <div className="hidden md:flex flex-col w-[260px] border-r border-border/40 p-4 space-y-6 bg-card/20">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
        <div className="flex-1 pt-4 space-y-3">
          <Skeleton className="h-4 w-28" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* Main Center Panel Skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="h-14 border-b border-border/40 px-6 flex items-center justify-between">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <PracticeConsoleSkeleton />
        </div>
      </div>
    </div>
  )
}
