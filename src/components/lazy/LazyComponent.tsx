"use client";

import { Suspense, ComponentType, lazy, useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/skeletons";

// 기본 Lazy 컴포넌트 래퍼
export function LazyComponent<T extends ComponentType<any>>({
  loader,
  fallback,
  ...props
}: {
  loader: () => Promise<{ default: T }>;
  fallback?: React.ReactNode;
} & React.ComponentProps<T>) {
  const Component = lazy(loader);

  return (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <Component {...props} />
    </Suspense>
  );
}

// 뷰포트 진입 시 로드
export function LazyOnView<T extends object>({
  loader,
  fallback,
  rootMargin = "100px",
  ...props
}: {
  loader: () => Promise<{ default: ComponentType<T> }>;
  fallback?: React.ReactNode;
  rootMargin?: string;
} & T) {
  const [Component, setComponent] = useState<ComponentType<T> | null>(null);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    if (isInView && !Component) {
      loader().then((mod) => setComponent(() => mod.default));
    }
  }, [isInView, Component, loader]);

  return (
    <div ref={containerRef}>
      {Component ? (
        <Component {...(props as T)} />
      ) : (
        fallback || <DefaultFallback />
      )}
    </div>
  );
}

// 아이들 타임에 로드 (백그라운드 프리로딩)
export function LazyOnIdle<T extends object>({
  loader,
  fallback,
  timeout = 2000,
  ...props
}: {
  loader: () => Promise<{ default: ComponentType<T> }>;
  fallback?: React.ReactNode;
  timeout?: number;
} & T) {
  const [Component, setComponent] = useState<ComponentType<T> | null>(null);

  useEffect(() => {
    let idleCallback: number;
    let timeoutId: NodeJS.Timeout;

    const load = () => {
      loader().then((mod) => setComponent(() => mod.default));
    };

    if ("requestIdleCallback" in window) {
      idleCallback = window.requestIdleCallback(load, { timeout });
    } else {
      // Fallback for Safari
      timeoutId = setTimeout(load, 100);
    }

    return () => {
      if (idleCallback) {
        window.cancelIdleCallback(idleCallback);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loader, timeout]);

  if (!Component) {
    return <>{fallback || <DefaultFallback />}</>;
  }

  return <Component {...(props as T)} />;
}

// 조건부 로드
export function LazyWhen<T extends object>({
  loader,
  condition,
  fallback,
  placeholder,
  ...props
}: {
  loader: () => Promise<{ default: ComponentType<T> }>;
  condition: boolean;
  fallback?: React.ReactNode;
  placeholder?: React.ReactNode;
} & T) {
  const [Component, setComponent] = useState<ComponentType<T> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (condition && !Component && !isLoading) {
      setIsLoading(true);
      loader()
        .then((mod) => setComponent(() => mod.default))
        .finally(() => setIsLoading(false));
    }
  }, [condition, Component, isLoading, loader]);

  if (!condition) {
    return <>{placeholder}</>;
  }

  if (!Component) {
    return <>{fallback || <DefaultFallback />}</>;
  }

  return <Component {...(props as T)} />;
}

function DefaultFallback() {
  return <Skeleton className="h-32 w-full rounded-xl" />;
}

// 타입 확장
declare global {
  interface Window {
    requestIdleCallback: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number;
    cancelIdleCallback: (handle: number) => void;
  }
}
