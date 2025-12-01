import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoodPal - AI 멘탈 헬스케어 컴패니언",
  description: "마음이 힘들 때, 언제든 곁에 있는 AI 친구. 24시간 공감 대화, 명상 프로그램, CBT 도구까지.",
  keywords: ["멘탈헬스", "AI상담", "명상", "마음챙김", "CBT", "감정관리", "스트레스", "불안"],
  authors: [{ name: "MoodPal" }],
  creator: "MoodPal",
  publisher: "MoodPal",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MoodPal",
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://moodpal.app",
    title: "MoodPal - AI 멘탈 헬스케어 컴패니언",
    description: "마음이 힘들 때, 언제든 곁에 있는 AI 친구",
    siteName: "MoodPal",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoodPal - AI 멘탈 헬스케어 컴패니언",
    description: "마음이 힘들 때, 언제든 곁에 있는 AI 친구",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFBF5" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1625" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
