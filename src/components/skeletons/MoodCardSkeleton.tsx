"use client";

import { Skeleton, SkeletonCircle } from "./BaseSkeleton";

export function MoodCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SkeletonCircle size={48} />
          <div>
            <Skeleton className="h-5 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* 감정 태그들 */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>

      {/* 메모 */}
      <Skeleton className="h-16 w-full rounded-lg" />

      {/* 시간 */}
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function MoodCheckInSkeleton() {
  return (
    <div className="space-y-6">
      {/* 질문 */}
      <div className="text-center space-y-2">
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      {/* 이모지 선택 */}
      <div className="flex justify-center gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCircle key={i} size={56} />
        ))}
      </div>

      {/* 감정 라벨 */}
      <div className="flex justify-center gap-2 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>

      {/* 버튼 */}
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

export function MoodHistorySkeleton() {
  return (
    <div className="space-y-4">
      {/* 차트 영역 */}
      <div className="rounded-xl border bg-card p-4">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>

      {/* 기록 리스트 */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <MoodCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
