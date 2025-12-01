"use client";

import { Skeleton, SkeletonCircle, SkeletonText } from "./BaseSkeleton";

export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center gap-3 p-4 border-b">
        <SkeletonCircle size={40} />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* 메시지 영역 스켈레톤 */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {/* AI 메시지 */}
        <div className="flex gap-3">
          <SkeletonCircle size={36} />
          <div className="flex-1 max-w-[80%]">
            <Skeleton className="h-24 rounded-2xl rounded-tl-sm" />
          </div>
        </div>

        {/* 사용자 메시지 */}
        <div className="flex gap-3 justify-end">
          <div className="max-w-[80%]">
            <Skeleton className="h-12 w-48 rounded-2xl rounded-tr-sm" />
          </div>
        </div>

        {/* AI 메시지 */}
        <div className="flex gap-3">
          <SkeletonCircle size={36} />
          <div className="flex-1 max-w-[80%]">
            <Skeleton className="h-16 rounded-2xl rounded-tl-sm" />
          </div>
        </div>

        {/* 타이핑 인디케이터 */}
        <div className="flex gap-3">
          <SkeletonCircle size={36} />
          <div className="flex gap-1 items-center px-4 py-3 bg-muted/30 rounded-2xl rounded-tl-sm">
            <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>

      {/* 입력 영역 스켈레톤 */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-12 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ChatMessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  if (isUser) {
    return (
      <div className="flex gap-3 justify-end">
        <div className="max-w-[80%]">
          <Skeleton className="h-12 w-40 rounded-2xl rounded-tr-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <SkeletonCircle size={36} />
      <div className="flex-1 max-w-[80%]">
        <Skeleton className="h-20 rounded-2xl rounded-tl-sm" />
      </div>
    </div>
  );
}
