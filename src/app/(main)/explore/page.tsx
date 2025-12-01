"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Wind,
  Moon,
  Heart,
  Sparkles,
  Timer,
  Lock,
  Play,
  ChevronRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/Header";
import { useUserStore } from "@/lib/store";
import { MEDITATION_PROGRAMS } from "@/lib/constants";
import { getCategoryLabel, formatDuration } from "@/lib/utils";
import { MindfulnessCategory } from "@/types";

const CATEGORIES: { id: MindfulnessCategory; label: string; icon: React.ReactNode }[] = [
  { id: "sos", label: "SOS", icon: <Sparkles className="w-5 h-5" /> },
  { id: "breathing", label: "호흡", icon: <Wind className="w-5 h-5" /> },
  { id: "sleep", label: "수면", icon: <Moon className="w-5 h-5" /> },
  { id: "anxiety_relief", label: "불안 완화", icon: <Heart className="w-5 h-5" /> },
  { id: "self_compassion", label: "자기자비", icon: <Heart className="w-5 h-5" /> },
  { id: "gratitude", label: "감사", icon: <Sparkles className="w-5 h-5" /> },
];

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreLoadingFallback />}>
      <ExploreContent />
    </Suspense>
  );
}

function ExploreLoadingFallback() {
  return (
    <div className="min-h-screen">
      <Header title="탐색" showLogo={false} showSettings />
      <div className="max-w-lg mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-xl"></div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-16 bg-muted rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useUserStore();

  const isPremium = user?.plan === "premium" || user?.plan === "premium_plus";

  const filteredPrograms = MEDITATION_PROGRAMS.filter((program) => {
    if (selectedCategory !== "all" && program.category !== selectedCategory) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        program.title.toLowerCase().includes(query) ||
        program.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const freePrograms = filteredPrograms.filter((p) => p.accessType === "free");
  const premiumPrograms = filteredPrograms.filter(
    (p) => p.accessType === "premium"
  );

  return (
    <div className="min-h-screen">
      <Header title="탐색" showLogo={false} showSettings />

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* 검색 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="명상, 프로그램 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.section>

        {/* SOS 배너 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border-orange-500/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">지금 마음이 힘들다면</p>
                  <p className="text-sm text-muted-foreground">
                    3분 호흡으로 마음을 진정시켜요
                  </p>
                </div>
                <Link href="/explore/sos-3min-breathing">
                  <Button size="sm" className="gap-1">
                    <Play className="w-4 h-4" /> 시작
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 카테고리 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className="shrink-0"
            >
              전체
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="shrink-0 gap-1"
              >
                {cat.icon}
                {cat.label}
              </Button>
            ))}
          </div>
        </motion.section>

        {/* 프로그램 목록 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* 무료 프로그램 */}
          {freePrograms.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                무료 프로그램
              </h2>
              <div className="space-y-3">
                {freePrograms.map((program, index) => (
                  <ProgramCard
                    key={program.id}
                    program={program}
                    index={index}
                    isPremium={isPremium}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 프리미엄 프로그램 */}
          {premiumPrograms.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                프리미엄
                {!isPremium && (
                  <Badge variant="premium" className="text-[10px]">
                    PRO
                  </Badge>
                )}
              </h2>
              <div className="space-y-3">
                {premiumPrograms.map((program, index) => (
                  <ProgramCard
                    key={program.id}
                    program={program}
                    index={index}
                    isPremium={isPremium}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredPrograms.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                검색 결과가 없어요
              </p>
            </div>
          )}
        </motion.section>

        {/* 프리미엄 업그레이드 배너 */}
        {!isPremium && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
              <CardContent className="p-5 text-center">
                <p className="font-semibold mb-2">
                  100+ 명상 프로그램을 무제한으로
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  프리미엄으로 업그레이드하세요
                </p>
                <Link href="/subscription">
                  <Button variant="gradient">업그레이드</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.section>
        )}
      </div>
    </div>
  );
}

function ProgramCard({
  program,
  index,
  isPremium,
}: {
  program: (typeof MEDITATION_PROGRAMS)[0];
  index: number;
  isPremium: boolean;
}) {
  const isLocked = program.accessType === "premium" && !isPremium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={isLocked ? "/subscription" : `/explore/${program.id}`}
      >
        <Card className="card-hover overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shrink-0 relative">
              {getCategoryIcon(program.category)}
              {isLocked && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{program.title}</p>
                {program.accessType === "free" && (
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    무료
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {program.description}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  {program.duration}분
                </span>
                <span>{program.instructor}</span>
                <span>{getCategoryLabel(program.category)}</span>
              </div>
            </div>

            {!isLocked && (
              <Button size="icon" variant="ghost" className="shrink-0">
                <Play className="w-5 h-5" />
              </Button>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "sos":
      return <Sparkles className="w-7 h-7 text-orange-500" />;
    case "breathing":
      return <Wind className="w-7 h-7 text-teal-500" />;
    case "sleep":
      return <Moon className="w-7 h-7 text-indigo-500" />;
    case "anxiety_relief":
    case "stress_relief":
      return <Heart className="w-7 h-7 text-pink-500" />;
    case "self_compassion":
      return <Heart className="w-7 h-7 text-rose-500" />;
    case "gratitude":
      return <Sparkles className="w-7 h-7 text-amber-500" />;
    default:
      return <Wind className="w-7 h-7 text-primary" />;
  }
}
