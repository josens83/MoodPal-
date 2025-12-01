"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  BarChart3,
  PieChart,
  Sun,
  Moon,
  Clock,
  Activity,
  Heart,
  Brain,
  ChevronLeft,
  ChevronRight,
  Share2,
  Download,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/layout/Header";
import { useUserStore } from "@/lib/store";
import { getMoodEmoji, getMoodColor, getMoodLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

const SAMPLE_REPORT = {
  weekOf: new Date(),
  avgValence: 0.3,
  avgArousal: 5.5,
  dominantMoods: ["calm", "anxious", "happy"],
  moodVariability: 2.3,
  totalCheckIns: 12,
  checkInStreak: 5,
  meditationMinutes: 45,
  aiConversations: 8,
  timePatterns: {
    morning: { primary: "calm" as const, intensity: 6 },
    afternoon: { primary: "anxious" as const, intensity: 7 },
    evening: { primary: "peaceful" as const, intensity: 5 },
  },
  weeklyComparison: {
    mood: 0.15, // 지난 주 대비 증가
    checkIns: -2,
    meditation: 10,
  },
  insights: [
    "오후에 불안감이 높아지는 패턴이 있어요",
    "명상 시간이 지난 주보다 10분 늘었어요",
    "주 5일 연속 체크인 중이에요!",
  ],
  affirmation: "한 주 동안 꾸준히 마음을 돌보셨네요. 대단해요! 💜",
};

export default function ReportPage() {
  const { user } = useUserStore();
  const isPremium = user?.plan === "premium" || user?.plan === "premium_plus";
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const report = SAMPLE_REPORT;

  const formatWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    return `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()} - ${
      endOfWeek.getMonth() + 1
    }/${endOfWeek.getDate()}`;
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen">
      <Header title="주간 리포트" showLogo={false} showSettings />

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* 주간 선택 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const prev = new Date(currentWeek);
                prev.setDate(prev.getDate() - 7);
                setCurrentWeek(prev);
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <p className="font-semibold">{formatWeekRange(currentWeek)}</p>
              <p className="text-sm text-muted-foreground">주간 리포트</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              disabled={currentWeek >= new Date()}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.section>

        {/* 요약 카드 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
            <CardContent className="p-5">
              <div className="text-center mb-4">
                <p className="text-lg font-semibold mb-1">이번 주 요약</p>
                <p className="text-sm text-muted-foreground">
                  {report.affirmation}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {report.totalCheckIns}
                  </p>
                  <p className="text-xs text-muted-foreground">체크인</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-teal-500">
                    {report.meditationMinutes}분
                  </p>
                  <p className="text-xs text-muted-foreground">명상</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-500">
                    {report.checkInStreak}일
                  </p>
                  <p className="text-xs text-muted-foreground">연속</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 주요 감정 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4" />
                자주 느낀 감정
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {report.dominantMoods.map((mood, index) => (
                  <div
                    key={mood}
                    className="flex items-center gap-2 px-4 py-2 rounded-full"
                    style={{
                      backgroundColor: `${getMoodColor(mood)}20`,
                    }}
                  >
                    <span className="text-xl">{getMoodEmoji(mood)}</span>
                    <span className="font-medium">{getMoodLabel(mood)}</span>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        1위
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 시간대별 패턴 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                시간대별 패턴
                {!isPremium && (
                  <Badge variant="premium" className="text-[10px]">
                    PRO
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPremium ? (
                <div className="space-y-4">
                  {Object.entries(report.timePatterns).map(([time, data]) => (
                    <div key={time} className="flex items-center gap-4">
                      <div className="w-16 text-sm text-muted-foreground">
                        {time === "morning"
                          ? "아침"
                          : time === "afternoon"
                          ? "오후"
                          : "저녁"}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {getMoodEmoji(data.primary)}
                        </span>
                        <span className="text-sm">
                          {getMoodLabel(data.primary)}
                        </span>
                      </div>
                      <Progress
                        value={data.intensity * 10}
                        className="flex-1 h-2"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Lock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    시간대별 감정 패턴을 확인하세요
                  </p>
                  <Link href="/subscription">
                    <Button size="sm" variant="outline">
                      프리미엄 시작
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* 지난 주 대비 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                지난 주 대비
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {getTrendIcon(report.weeklyComparison.mood)}
                    <span className="text-sm font-medium">
                      {Math.abs(report.weeklyComparison.mood * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">기분</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {getTrendIcon(report.weeklyComparison.checkIns)}
                    <span className="text-sm font-medium">
                      {Math.abs(report.weeklyComparison.checkIns)}회
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">체크인</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {getTrendIcon(report.weeklyComparison.meditation)}
                    <span className="text-sm font-medium">
                      {Math.abs(report.weeklyComparison.meditation)}분
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">명상</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* AI 인사이트 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI 인사이트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.insights.map((insight, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs text-primary font-medium">
                      {index + 1}
                    </span>
                    {insight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.section>

        {/* 공유 및 다운로드 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3"
        >
          <Button variant="outline" className="flex-1 gap-2">
            <Share2 className="w-4 h-4" />
            공유하기
          </Button>
          <Button variant="outline" className="flex-1 gap-2">
            <Download className="w-4 h-4" />
            다운로드
          </Button>
        </motion.section>
      </div>
    </div>
  );
}
