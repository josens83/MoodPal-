"use client";

import { Skeleton, SkeletonCircle, SkeletonCard } from "./BaseSkeleton";
import { MeditationCardSkeleton } from "./MeditationSkeleton";

export function HomeSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* 헤더 인사 */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <SkeletonCircle size={48} />
      </div>

      {/* 오늘의 기분 카드 */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32 bg-white/30" />
          <Skeleton className="h-8 w-20 rounded-full bg-white/30" />
        </div>
        <div className="flex justify-center gap-4 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCircle key={i} size={48} className="bg-white/30" />
          ))}
        </div>
      </div>

      {/* 퀵 액션 버튼들 */}
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>

      {/* AI 컴패니언 카드 */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center gap-3">
          <SkeletonCircle size={48} />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      </div>

      {/* 추천 명상 섹션 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shrink-0 w-40">
              <MeditationCardSkeleton />
            </div>
          ))}
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-20" />
        <SkeletonCard />
      </div>
    </div>
  );
}

export function HomeHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div>
        <Skeleton className="h-6 w-32 mb-1" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );
}
