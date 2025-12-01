"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Moon,
  Sun,
  Coffee,
  Smartphone,
  Dumbbell,
  Wine,
  Clock,
  TrendingUp,
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Header } from "@/components/layout/Header";
import { useUserStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

const SLEEP_FACTORS = [
  { id: "caffeine", label: "카페인", icon: Coffee },
  { id: "alcohol", label: "알코올", icon: Wine },
  { id: "exercise", label: "운동", icon: Dumbbell },
  { id: "screen", label: "스크린타임", icon: Smartphone },
];

export default function SleepPage() {
  const { user } = useUserStore();
  const isPremium = user?.plan === "premium" || user?.plan === "premium_plus";
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // 샘플 데이터
  const sleepData = [
    { date: new Date(), duration: 7.5, quality: 8 },
    { date: new Date(Date.now() - 86400000), duration: 6, quality: 5 },
    { date: new Date(Date.now() - 86400000 * 2), duration: 8, quality: 9 },
    { date: new Date(Date.now() - 86400000 * 3), duration: 5.5, quality: 4 },
    { date: new Date(Date.now() - 86400000 * 4), duration: 7, quality: 7 },
  ];

  const avgDuration =
    sleepData.reduce((sum, d) => sum + d.duration, 0) / sleepData.length;
  const avgQuality =
    sleepData.reduce((sum, d) => sum + d.quality, 0) / sleepData.length;

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const getSleepDataForDate = (date: Date) => {
    return sleepData.find(
      (d) => d.date.toDateString() === date.toDateString()
    );
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 7) return "bg-green-500";
    if (quality >= 5) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen">
      <Header title="수면 트래커" showLogo={false} showSettings />

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* 오늘 수면 기록 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <Moon className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-semibold">어젯밤 수면</p>
                    <p className="text-sm text-muted-foreground">
                      기록이 없어요
                    </p>
                  </div>
                </div>
                <Button onClick={() => setShowAddEntry(true)} className="gap-1">
                  <Plus className="w-4 h-4" /> 기록
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 주간 캘린더 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
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
                <CardTitle className="text-base">이번 주</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const next = new Date(currentWeek);
                    next.setDate(next.getDate() + 7);
                    if (next <= new Date()) {
                      setCurrentWeek(next);
                    }
                  }}
                  disabled={
                    new Date(currentWeek).getTime() + 7 * 24 * 60 * 60 * 1000 >
                    Date.now()
                  }
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, index) => {
                  const data = getSleepDataForDate(day);
                  const isToday =
                    day.toDateString() === new Date().toDateString();
                  const isFuture = day > new Date();

                  return (
                    <div
                      key={index}
                      className={cn(
                        "text-center py-2",
                        isToday && "ring-2 ring-primary rounded-lg"
                      )}
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        {WEEK_DAYS[index]}
                      </p>
                      <p className="text-sm mb-2">{day.getDate()}</p>
                      <div
                        className={cn(
                          "h-16 rounded-lg flex items-end justify-center pb-1",
                          isFuture
                            ? "bg-muted/30"
                            : data
                            ? "bg-muted"
                            : "bg-muted/50"
                        )}
                      >
                        {data && (
                          <div
                            className={cn(
                              "w-full mx-1 rounded transition-all",
                              getQualityColor(data.quality)
                            )}
                            style={{
                              height: `${(data.duration / 10) * 100}%`,
                              opacity: 0.7,
                            }}
                          />
                        )}
                      </div>
                      {data && (
                        <p className="text-xs mt-1 text-muted-foreground">
                          {data.duration}h
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 통계 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                이번 주 통계
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <p className="text-2xl font-bold text-indigo-500">
                    {avgDuration.toFixed(1)}h
                  </p>
                  <p className="text-xs text-muted-foreground">평균 수면 시간</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <p className="text-2xl font-bold text-teal-500">
                    {avgQuality.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">평균 수면 품질</p>
                </div>
              </div>

              {isPremium ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">수면 패턴 분석</p>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      평균 취침 시간: 오후 11:30
                    </p>
                    <p className="text-sm text-muted-foreground">
                      평균 기상 시간: 오전 7:00
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-muted/30 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      상세 분석은 프리미엄에서
                    </p>
                  </div>
                  <Link href="/subscription">
                    <Button size="sm" variant="outline">
                      업그레이드
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* 수면 프로그램 바로가기 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <Moon className="w-7 h-7 text-indigo-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">수면 명상</p>
                  <p className="text-sm text-muted-foreground">
                    편안한 수면을 위한 명상 프로그램
                  </p>
                </div>
                <Link href="/explore?category=sleep">
                  <Button size="sm">바로가기</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>

      {/* 수면 기록 추가 모달 */}
      <SleepEntryDialog open={showAddEntry} onOpenChange={setShowAddEntry} />
    </div>
  );
}

function SleepEntryDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [bedTime, setBedTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [quality, setQuality] = useState(7);
  const [factors, setFactors] = useState<Record<string, boolean>>({
    caffeine: false,
    alcohol: false,
    exercise: false,
    screen: false,
  });

  const toggleFactor = (id: string) => {
    setFactors((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const calculateDuration = () => {
    const [bedH, bedM] = bedTime.split(":").map(Number);
    const [wakeH, wakeM] = wakeTime.split(":").map(Number);

    let duration = wakeH - bedH + (wakeM - bedM) / 60;
    if (duration < 0) duration += 24;

    return duration.toFixed(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-500" />
            수면 기록하기
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 시간 입력 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                <Moon className="w-4 h-4" /> 취침 시간
              </label>
              <input
                type="time"
                value={bedTime}
                onChange={(e) => setBedTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                <Sun className="w-4 h-4" /> 기상 시간
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background"
              />
            </div>
          </div>

          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">총 수면 시간</p>
            <p className="text-2xl font-bold text-indigo-500">
              {calculateDuration()}시간
            </p>
          </div>

          {/* 수면 품질 */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              수면 품질 ({quality}/10)
            </label>
            <Slider
              value={[quality]}
              onValueChange={([v]) => setQuality(v)}
              min={1}
              max={10}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>매우 나쁨</span>
              <span>매우 좋음</span>
            </div>
          </div>

          {/* 수면 요인 */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              어제 한 것 (선택)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {SLEEP_FACTORS.map((factor) => {
                const Icon = factor.icon;
                return (
                  <button
                    key={factor.id}
                    onClick={() => toggleFactor(factor.id)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border transition-all",
                      factors[factor.id]
                        ? "border-primary bg-primary/10"
                        : "border-muted bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{factor.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={() => onOpenChange(false)}>저장</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
