"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60",
        className
      )}
      style={style}
      {...props}
    />
  );
}

export function SkeletonText({ className, lines = 1 }: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCircle({ className, size = 40 }: SkeletonProps & { size?: number }) {
  return (
    <Skeleton
      className={cn("rounded-full", className)}
      style={{ width: size, height: size }}
    />
  );
}

export function SkeletonButton({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-10 w-24 rounded-lg", className)} />;
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-4 space-y-3", className)}>
      <Skeleton className="h-5 w-2/3" />
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}
