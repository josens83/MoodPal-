"use client";

import { Skeleton, SkeletonText } from "./BaseSkeleton";

export function MeditationCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* 이미지 영역 */}
      <Skeleton className="h-32 w-full" />

      {/* 콘텐츠 영역 */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function MeditationGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MeditationCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function MeditationPlayerSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* 배경 이미지 영역 */}
      <div className="relative flex-1">
        <Skeleton className="absolute inset-0" />

        {/* 오버레이 콘텐츠 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          {/* 타이틀 */}
          <div className="text-center mb-8 space-y-2">
            <Skeleton className="h-8 w-48 mx-auto bg-white/20" />
            <Skeleton className="h-4 w-32 mx-auto bg-white/20" />
          </div>

          {/* 프로그레스 바 */}
          <div className="w-full max-w-md space-y-2">
            <Skeleton className="h-2 w-full rounded-full bg-white/20" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-10 bg-white/20" />
              <Skeleton className="h-3 w-10 bg-white/20" />
            </div>
          </div>

          {/* 컨트롤 버튼 */}
          <div className="flex items-center gap-8 mt-8">
            <Skeleton className="h-12 w-12 rounded-full bg-white/20" />
            <Skeleton className="h-16 w-16 rounded-full bg-white/20" />
            <Skeleton className="h-12 w-12 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MeditationDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* 헤더 이미지 */}
      <Skeleton className="h-64 w-full rounded-xl" />

      {/* 제목 및 정보 */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>

      {/* 설명 */}
      <SkeletonText lines={4} />

      {/* 시작 버튼 */}
      <Skeleton className="h-14 w-full rounded-xl" />

      {/* 관련 프로그램 */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shrink-0 w-40">
              <MeditationCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
