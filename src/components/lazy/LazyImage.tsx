"use client";

import { useState, useRef, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/skeletons";

interface LazyImageProps extends Omit<ImageProps, "onLoad"> {
  fallbackSrc?: string;
  aspectRatio?: string;
  showSkeleton?: boolean;
}

export function LazyImage({
  src,
  alt,
  className,
  fallbackSrc = "/images/placeholder.png",
  aspectRatio,
  showSkeleton = true,
  ...props
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px", // 뷰포트 50px 전에 미리 로드
        threshold: 0.01,
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  return (
    <div
      ref={imageRef}
      className={cn("relative overflow-hidden", className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* 스켈레톤 로딩 */}
      {showSkeleton && isLoading && (
        <Skeleton className="absolute inset-0" />
      )}

      {/* 이미지 */}
      {isInView && (
        <Image
          src={error ? fallbackSrc : src}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  );
}

// 프로필 이미지 전용
export function LazyAvatar({
  src,
  alt,
  size = 40,
  className,
}: {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}) {
  const [error, setError] = useState(false);

  const fallbackInitial = alt.charAt(0).toUpperCase();

  if (!src || error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium",
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {fallbackInitial}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      onError={() => setError(true)}
    />
  );
}

// 배경 이미지 (그라디언트 오버레이 포함)
export function LazyBackgroundImage({
  src,
  alt,
  children,
  className,
  overlayClassName,
}: {
  src: string;
  alt: string;
  children?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* 스켈레톤 */}
      {isLoading && <Skeleton className="absolute inset-0" />}

      {/* 배경 이미지 */}
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          "object-cover transition-opacity duration-500",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        priority={false}
      />

      {/* 오버레이 */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent",
          overlayClassName
        )}
      />

      {/* 콘텐츠 */}
      {children && (
        <div className="relative z-10">{children}</div>
      )}
    </div>
  );
}
