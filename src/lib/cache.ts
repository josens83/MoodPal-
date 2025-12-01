/**
 * 캐싱 전략 설정 (Netflix/Spotify 벤치마킹)
 */

// 캐시 이름
export const CACHE_NAMES = {
  static: "moodpal-static-v1",
  dynamic: "moodpal-dynamic-v1",
  api: "moodpal-api-v1",
  audio: "moodpal-audio-v1",
  images: "moodpal-images-v1",
} as const;

// 캐시 전략 타입
export type CacheStrategy =
  | "CacheFirst"
  | "NetworkFirst"
  | "StaleWhileRevalidate"
  | "NetworkOnly"
  | "CacheOnly";

// 라우트별 캐시 전략
export const CACHE_STRATEGIES: Record<string, CacheStrategy> = {
  // 정적 자산 - 캐시 우선
  "/icons/": "CacheFirst",
  "/images/": "CacheFirst",
  "/audio/": "CacheFirst",
  "/_next/static/": "CacheFirst",

  // API - 네트워크 우선
  "/api/mood": "NetworkFirst",
  "/api/chat": "NetworkOnly",
  "/api/auth": "NetworkOnly",
  "/api/payment": "NetworkOnly",

  // 페이지 - Stale While Revalidate
  "/home": "StaleWhileRevalidate",
  "/explore": "StaleWhileRevalidate",
  "/journal": "StaleWhileRevalidate",
  "/profile": "StaleWhileRevalidate",

  // 실시간 데이터 - 네트워크만
  "/chat": "NetworkFirst",
  "/crisis": "NetworkOnly",
};

// TTL 설정
export const CACHE_TTL = {
  // 정적 자산 (1년)
  static: 365 * 24 * 60 * 60 * 1000,

  // API 응답 (5분)
  api: 5 * 60 * 1000,

  // 이미지 (7일)
  images: 7 * 24 * 60 * 60 * 1000,

  // 오디오 (30일)
  audio: 30 * 24 * 60 * 60 * 1000,

  // 동적 페이지 (1시간)
  dynamic: 60 * 60 * 1000,
} as const;

// 오프라인 대체 콘텐츠
export const OFFLINE_FALLBACKS = {
  page: "/offline",
  image: "/images/offline-placeholder.png",
  audio: null,
} as const;

// 프리캐시할 URL 목록
export const PRECACHE_URLS = [
  "/",
  "/home",
  "/offline",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// 캐시 유틸리티 함수들
export class CacheManager {
  /**
   * URL에 맞는 캐시 전략 반환
   */
  static getStrategy(url: string): CacheStrategy {
    for (const [pattern, strategy] of Object.entries(CACHE_STRATEGIES)) {
      if (url.includes(pattern)) {
        return strategy;
      }
    }
    return "NetworkFirst"; // 기본값
  }

  /**
   * URL에 맞는 캐시 이름 반환
   */
  static getCacheName(url: string): string {
    if (url.includes("/audio/")) return CACHE_NAMES.audio;
    if (url.includes("/images/") || url.includes("/icons/"))
      return CACHE_NAMES.images;
    if (url.includes("/api/")) return CACHE_NAMES.api;
    if (url.includes("/_next/static/")) return CACHE_NAMES.static;
    return CACHE_NAMES.dynamic;
  }

  /**
   * 캐시 정리 (오래된 항목 삭제)
   */
  static async cleanup(): Promise<void> {
    const cacheNames = await caches.keys();
    const validNames = Object.values(CACHE_NAMES);

    await Promise.all(
      cacheNames
        .filter((name) => !validNames.includes(name as any))
        .map((name) => caches.delete(name))
    );
  }

  /**
   * 특정 패턴의 캐시 무효화
   */
  static async invalidate(pattern: string): Promise<void> {
    const cacheNames = await caches.keys();

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();

      for (const request of requests) {
        if (request.url.includes(pattern)) {
          await cache.delete(request);
        }
      }
    }
  }

  /**
   * 캐시 사용량 확인
   */
  static async getUsage(): Promise<{
    usage: number;
    quota: number;
    percentage: number;
  }> {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      return {
        usage,
        quota,
        percentage: quota > 0 ? (usage / quota) * 100 : 0,
      };
    }
    return { usage: 0, quota: 0, percentage: 0 };
  }
}

// React Query / SWR 캐시 설정
export const QUERY_CACHE_CONFIG = {
  // 기본 stale time (5분)
  defaultStaleTime: 5 * 60 * 1000,

  // 기본 캐시 time (30분)
  defaultCacheTime: 30 * 60 * 1000,

  // 재시도 설정
  retry: 3,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),

  // 쿼리별 설정
  queries: {
    moodEntries: {
      staleTime: 1 * 60 * 1000, // 1분
      cacheTime: 10 * 60 * 1000, // 10분
    },
    meditations: {
      staleTime: 30 * 60 * 1000, // 30분
      cacheTime: 60 * 60 * 1000, // 1시간
    },
    userProfile: {
      staleTime: 5 * 60 * 1000, // 5분
      cacheTime: 30 * 60 * 1000, // 30분
    },
    achievements: {
      staleTime: 10 * 60 * 1000, // 10분
      cacheTime: 60 * 60 * 1000, // 1시간
    },
  },
};
