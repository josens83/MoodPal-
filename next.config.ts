import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 이미지 최적화
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 420, 768, 1024, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1년
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // 실험적 기능
  experimental: {
    // 패키지 임포트 최적화 (트리 쉐이킹 개선)
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-slider",
      "@radix-ui/react-switch",
      "@radix-ui/react-select",
      "date-fns",
    ],
  },

  // 헤더 설정 (캐싱 및 보안)
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|png|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/audio/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // 리다이렉트
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/home",
        permanent: true,
      },
    ];
  },

  // 리라이트 (API 프록시 등)
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },

  // 빌드 시 타입 체크 건너뛰기 (CI에서 별도 실행 권장)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Powered by 헤더 제거
  poweredByHeader: false,

  // 압축
  compress: true,

  // 정적 페이지 생성 타임아웃
  staticPageGenerationTimeout: 120,

  // 로깅 설정
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
