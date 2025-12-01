"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  MessageCircle,
  Wind,
  Moon,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Heart,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { useMoodCheckInStore, useTodayStore, useUserStore } from "@/lib/store";
import { getGreeting, getMoodEmoji, getMoodLabel, getMoodColor } from "@/lib/utils";
import { MEDITATION_PROGRAMS, SUBSCRIPTION_PLANS } from "@/lib/constants";

export default function HomePage() {
  const { openCheckIn } = useMoodCheckInStore();
  const { todayMood, checkInCount, conversationCount, meditationMinutes } = useTodayStore();
  const { user, preferences } = useUserStore();

  const greeting = getGreeting();

  return (
    <div className="min-h-screen">
      <Header
        user={{
          name: user?.name || "사용자",
          image: user?.image,
          plan: user?.plan,
        }}
      />

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* 인사 섹션 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-6"
        >
          <h1 className="text-2xl font-bold mb-2">{greeting}</h1>
          <p className="text-muted-foreground">
            {user?.name || "친구"}님, 오늘 기분은 어때요?
          </p>
        </motion.section>

        {/* 오늘의 감정 / 체크인 버튼 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {todayMood ? (
            <Card className="overflow-hidden">
              <div
                className="h-2"
                style={{ backgroundColor: getMoodColor(todayMood.primary) }}
              />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                      style={{
                        backgroundColor: `${getMoodColor(todayMood.primary)}20`,
                      }}
                    >
                      {getMoodEmoji(todayMood.primary)}
                    </div>
                    <div>
                      <p className="font-medium">{getMoodLabel(todayMood.primary)}</p>
                      <p className="text-sm text-muted-foreground">
                        강도: {todayMood.intensity}/10
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={openCheckIn}>
                    다시 기록
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              size="xl"
              className="w-full h-20 text-lg gap-3"
              onClick={openCheckIn}
            >
              <Plus className="w-6 h-6" />
              오늘의 기분 기록하기
            </Button>
          )}
        </motion.section>

        {/* 빠른 액션 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3"
        >
          <Link href="/chat">
            <Card className="card-hover p-4 text-center cursor-pointer">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">대화하기</p>
            </Card>
          </Link>
          <Link href="/explore?category=sos">
            <Card className="card-hover p-4 text-center cursor-pointer">
              <Wind className="w-8 h-8 mx-auto mb-2 text-teal-500" />
              <p className="text-sm font-medium">호흡 명상</p>
            </Card>
          </Link>
          <Link href="/explore?category=sleep">
            <Card className="card-hover p-4 text-center cursor-pointer">
              <Moon className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
              <p className="text-sm font-medium">수면</p>
            </Card>
          </Link>
        </motion.section>

        {/* 오늘의 활동 요약 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                오늘의 활동
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{checkInCount}</p>
                <p className="text-xs text-muted-foreground">감정 기록</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-teal-500">{conversationCount}</p>
                <p className="text-xs text-muted-foreground">대화</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-500">{meditationMinutes}분</p>
                <p className="text-xs text-muted-foreground">명상</p>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 추천 명상 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">추천 명상</h2>
            <Link href="/explore" className="text-sm text-primary flex items-center">
              전체보기 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {MEDITATION_PROGRAMS.filter((p) => p.accessType === "free")
              .slice(0, 2)
              .map((program) => (
                <Link key={program.id} href={`/explore/${program.id}`}>
                  <Card className="card-hover">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                        <Wind className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{program.title}</p>
                          {program.accessType === "free" && (
                            <Badge variant="secondary" className="text-[10px]">
                              무료
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {program.duration}분 · {program.instructor}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </motion.section>

        {/* 프리미엄 배너 (무료 사용자만) */}
        {user?.plan === "free" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="overflow-hidden bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">프리미엄으로 업그레이드</p>
                    <p className="text-sm text-muted-foreground">
                      무제한 대화, 100+ 명상 프로그램
                    </p>
                  </div>
                </div>
                <Link href="/subscription">
                  <Button className="w-full mt-4" variant="gradient">
                    월 {SUBSCRIPTION_PLANS.premium.monthlyPrice.toLocaleString()}원부터
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* 주간 인사이트 프리뷰 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                이번 주 인사이트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">감정 안정도</span>
                <span className="text-sm font-medium">72%</span>
              </div>
              <Progress value={72} className="h-2" />
              <p className="text-xs text-muted-foreground mt-3">
                지난주보다 감정 안정도가 8% 향상되었어요!
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* 면책 조항 */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center py-4"
        >
          <p className="text-xs text-muted-foreground leading-relaxed">
            MoodPal은 전문 의료 서비스가 아닙니다.
            <br />
            위기 상황시{" "}
            <a href="tel:1393" className="text-primary underline">
              자살예방상담전화 1393
            </a>
            으로 연락하세요.
          </p>
        </motion.section>
      </div>
    </div>
  );
}
