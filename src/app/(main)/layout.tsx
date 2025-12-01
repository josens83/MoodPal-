"use client";

import { MobileNav } from "@/components/layout/MobileNav";
import { MoodCheckIn } from "@/components/mood/MoodCheckIn";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">{children}</main>
      <MobileNav />
      <MoodCheckIn />
    </div>
  );
}
