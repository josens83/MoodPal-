"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  User,
  Bell,
  Moon,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Crown,
  Sparkles,
  Settings,
  Heart,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Header } from "@/components/layout/Header";
import { useUserStore, useTodayStore } from "@/lib/store";
import { SUBSCRIPTION_PLANS, COMPANIONS } from "@/lib/constants";

export default function ProfilePage() {
  const { user, preferences, updatePreferences, logout } = useUserStore();
  const { checkInCount, conversationCount, meditationMinutes } = useTodayStore();

  const selectedCompanion = COMPANIONS.find(
    (c) => c.id === preferences.companionId
  ) || COMPANIONS[0];

  const menuItems = [
    {
      icon: <User className="w-5 h-5" />,
      label: "계정 설정",
      href: "/settings/account",
    },
    {
      icon: <Bell className="w-5 h-5" />,
      label: "알림 설정",
      href: "/settings/notifications",
    },
    {
      icon: <Moon className="w-5 h-5" />,
      label: "다크 모드",
      toggle: true,
      value: preferences.darkMode,
      onChange: (value: boolean) => updatePreferences({ darkMode: value }),
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: "개인정보 보호",
      href: "/settings/privacy",
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: "도움말",
      href: "/help",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header title="프로필" showLogo={false} showSettings />

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* 프로필 카드 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-primary/20">
                  <AvatarImage src={user?.image} alt={user?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {user?.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">
                      {user?.name || "사용자"}
                    </h2>
                    {user?.plan === "premium" && (
                      <Badge variant="premium" className="gap-1">
                        <Crown className="w-3 h-3" />
                        PRO
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {user?.email || "로그인이 필요합니다"}
                  </p>
                </div>
                <Link href="/settings/account">
                  <Button variant="ghost" size="icon">
                    <Settings className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 통계 요약 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">이번 달 활동</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <Heart className="w-5 h-5 mx-auto mb-1 text-pink-500" />
                  <p className="text-xl font-bold">{checkInCount * 7}</p>
                  <p className="text-[10px] text-muted-foreground">
                    감정 기록
                  </p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <MessageCircle className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-xl font-bold">{conversationCount * 3}</p>
                  <p className="text-[10px] text-muted-foreground">AI 대화</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <Sparkles className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  <p className="text-xl font-bold">{meditationMinutes * 5}</p>
                  <p className="text-[10px] text-muted-foreground">
                    명상 (분)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 컴패니언 선택 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">내 AI 컴패니언</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-3 bg-primary/5 rounded-xl">
                <Avatar className="w-12 h-12 border-2 border-primary/20">
                  <AvatarImage
                    src={selectedCompanion.avatar}
                    alt={selectedCompanion.name}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedCompanion.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{selectedCompanion.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCompanion.description}
                  </p>
                </div>
                <Link href="/settings/companion">
                  <Button variant="outline" size="sm">
                    변경
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 구독 상태 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {user?.plan === "free" ? (
            <Card className="overflow-hidden bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
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
                    월 {SUBSCRIPTION_PLANS.premium.monthlyPrice.toLocaleString()}
                    원부터
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {SUBSCRIPTION_PLANS[user?.plan || "premium"].name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        구독 중
                      </p>
                    </div>
                  </div>
                  <Link href="/subscription">
                    <Button variant="outline" size="sm">
                      관리
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.section>

        {/* 설정 메뉴 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-2">
              {menuItems.map((item, index) => (
                <div key={index}>
                  {item.toggle ? (
                    <div className="flex items-center justify-between p-3 rounded-xl">
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <Switch
                        checked={item.value}
                        onCheckedChange={item.onChange}
                      />
                    </div>
                  ) : (
                    <Link href={item.href || "#"}>
                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </Link>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.section>

        {/* 로그아웃 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="outline"
            className="w-full gap-2 text-destructive hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </Button>
        </motion.section>

        {/* 앱 정보 */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center py-4"
        >
          <p className="text-xs text-muted-foreground">
            MoodPal v1.0.0
            <br />
            <a href="/terms" className="underline">
              이용약관
            </a>{" "}
            ·{" "}
            <a href="/privacy" className="underline">
              개인정보처리방침
            </a>
          </p>
        </motion.section>
      </div>
    </div>
  );
}
