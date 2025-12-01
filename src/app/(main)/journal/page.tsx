"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  Calendar,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/Header";
import { useMoodCheckInStore } from "@/lib/store";
import {
  getMoodEmoji,
  getMoodLabel,
  getMoodColor,
  formatDate,
} from "@/lib/utils";
import { MoodEntry } from "@/types";

export default function JournalPage() {
  const { openCheckIn } = useMoodCheckInStore();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, [currentWeek]);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/mood?period=week");
      const data = await response.json();
      if (data.success) {
        setEntries(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const getEntryForDate = (date: Date) => {
    return entries.find((entry) => {
      const entryDate = new Date(entry.createdAt);
      return entryDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="min-h-screen">
      <Header title="감정 일기" showLogo={false} showSettings />

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* 주간 캘린더 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
                <CardTitle className="text-base">
                  {formatDate(weekDays[0])} - {formatDate(weekDays[6])}
                </CardTitle>
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
              <div className="grid grid-cols-7 gap-1">
                {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
                {weekDays.map((day, index) => {
                  const entry = getEntryForDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isFuture = day > new Date();

                  return (
                    <motion.button
                      key={index}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-sm transition-colors
                        ${isToday ? "ring-2 ring-primary" : ""}
                        ${isFuture ? "opacity-50" : "hover:bg-muted"}
                      `}
                      style={
                        entry
                          ? {
                              backgroundColor: `${getMoodColor(
                                entry.mood.primary
                              )}20`,
                            }
                          : {}
                      }
                      onClick={() => {
                        if (isToday && !entry) {
                          openCheckIn();
                        }
                      }}
                      disabled={isFuture}
                    >
                      <span className="text-xs text-muted-foreground">
                        {day.getDate()}
                      </span>
                      {entry && (
                        <span className="text-lg">
                          {getMoodEmoji(entry.mood.primary)}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 기록 버튼 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={openCheckIn}
          >
            <Plus className="w-5 h-5" />
            지금 기분 기록하기
          </Button>
        </motion.section>

        {/* 탭: 기록 목록 / 통계 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="entries">
            <TabsList className="w-full">
              <TabsTrigger value="entries" className="flex-1">
                <Calendar className="w-4 h-4 mr-2" />
                기록
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex-1">
                <BarChart3 className="w-4 h-4 mr-2" />
                통계
              </TabsTrigger>
            </TabsList>

            <TabsContent value="entries" className="mt-4 space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  불러오는 중...
                </div>
              ) : entries.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      아직 기록이 없어요
                    </p>
                    <Button onClick={openCheckIn}>첫 기록 남기기</Button>
                  </CardContent>
                </Card>
              ) : (
                entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="card-hover">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                            style={{
                              backgroundColor: `${getMoodColor(
                                entry.mood.primary
                              )}20`,
                            }}
                          >
                            {getMoodEmoji(entry.mood.primary)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {getMoodLabel(entry.mood.primary)}
                              </p>
                              <span className="text-sm text-muted-foreground">
                                강도 {entry.mood.intensity}/10
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(entry.createdAt)}
                            </p>
                            {entry.note && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                {entry.note}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="stats" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    이번 주 요약
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-xl">
                      <p className="text-2xl font-bold text-primary">
                        {entries.length}
                      </p>
                      <p className="text-xs text-muted-foreground">총 기록</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-xl">
                      <p className="text-2xl font-bold text-teal-500">
                        {entries.length > 0
                          ? (
                              entries.reduce((sum, e) => sum + e.mood.intensity, 0) /
                              entries.length
                            ).toFixed(1)
                          : "-"}
                      </p>
                      <p className="text-xs text-muted-foreground">평균 강도</p>
                    </div>
                  </div>

                  {entries.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">자주 느낀 감정</p>
                      <div className="flex flex-wrap gap-2">
                        {getMostFrequentMoods(entries)
                          .slice(0, 3)
                          .map((mood) => (
                            <span
                              key={mood}
                              className="px-3 py-1.5 rounded-full text-sm"
                              style={{
                                backgroundColor: `${getMoodColor(mood)}20`,
                              }}
                            >
                              {getMoodEmoji(mood)} {getMoodLabel(mood)}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.section>
      </div>
    </div>
  );
}

function getMostFrequentMoods(entries: MoodEntry[]): string[] {
  const moodCount: Record<string, number> = {};
  entries.forEach((entry) => {
    const mood = entry.mood.primary;
    moodCount[mood] = (moodCount[mood] || 0) + 1;
  });

  return Object.entries(moodCount)
    .sort((a, b) => b[1] - a[1])
    .map(([mood]) => mood);
}
