"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Check,
  Crown,
  Sparkles,
  MessageCircle,
  Moon,
  Brain,
  Users,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserStore } from "@/lib/store";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function SubscriptionPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const [selectedPlan, setSelectedPlan] = useState<"premium" | "premium_plus">(
    "premium"
  );
  const { user } = useUserStore();

  const premiumPrice =
    billingPeriod === "monthly"
      ? SUBSCRIPTION_PLANS.premium.monthlyPrice
      : SUBSCRIPTION_PLANS.premium.yearlyPrice;

  const premiumPlusPrice =
    billingPeriod === "monthly"
      ? SUBSCRIPTION_PLANS.premium_plus.monthlyPrice
      : SUBSCRIPTION_PLANS.premium_plus.yearlyPrice;

  const yearlyDiscount = Math.round(
    (1 -
      SUBSCRIPTION_PLANS.premium.yearlyPrice /
        (SUBSCRIPTION_PLANS.premium.monthlyPrice * 12)) *
      100
  );

  const features = [
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "무제한 AI 대화",
      description: "언제든 마음이 힘들 때 대화할 수 있어요",
      free: "3회/일",
      premium: "무제한",
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "100+ 명상 프로그램",
      description: "수면, 불안 완화, 자기자비 등 다양한 프로그램",
      free: "5개",
      premium: "100+",
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "CBT 도구",
      description: "생각 기록지, 행동 활성화 등 전문 도구",
      free: "제한적",
      premium: "전체",
    },
    {
      icon: <Moon className="w-5 h-5" />,
      title: "수면 프로그램",
      description: "수면 스토리, 수면 음악, 수면 분석",
      free: "제한적",
      premium: "전체",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "전문가 상담 할인",
      description: "전문 상담사와의 상담 10% 할인",
      free: "-",
      premium: "10% 할인",
    },
  ];

  const handleSubscribe = async () => {
    // TODO: Stripe 결제 연동
    alert("결제 기능은 준비 중입니다.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-lg border-b safe-top">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto">
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="flex-1 text-center font-semibold">구독 플랜</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* 헤더 섹션 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-6"
        >
          <div className="w-16 h-16 rounded-full gradient-primary mx-auto flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">프리미엄으로 업그레이드</h1>
          <p className="text-muted-foreground">
            더 나은 마음 건강 관리를 위해
          </p>
        </motion.section>

        {/* 결제 주기 선택 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs
            value={billingPeriod}
            onValueChange={(v) => setBillingPeriod(v as "monthly" | "yearly")}
          >
            <TabsList className="w-full">
              <TabsTrigger value="monthly" className="flex-1">
                월간
              </TabsTrigger>
              <TabsTrigger value="yearly" className="flex-1 gap-1">
                연간
                <Badge variant="success" className="text-[10px]">
                  {yearlyDiscount}% 할인
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.section>

        {/* 플랜 카드 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* 프리미엄 */}
          <Card
            className={cn(
              "cursor-pointer transition-all",
              selectedPlan === "premium"
                ? "ring-2 ring-primary"
                : "hover:border-primary/50"
            )}
            onClick={() => setSelectedPlan("premium")}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  프리미엄
                </CardTitle>
                {selectedPlan === "premium" && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold">
                  {premiumPrice.toLocaleString()}원
                </span>
                <span className="text-muted-foreground">
                  /{billingPeriod === "monthly" ? "월" : "년"}
                </span>
              </div>
              {billingPeriod === "yearly" && (
                <p className="text-sm text-muted-foreground">
                  월{" "}
                  {Math.round(premiumPrice / 12).toLocaleString()}
                  원 (연간 결제)
                </p>
              )}
              <ul className="mt-4 space-y-2">
                {SUBSCRIPTION_PLANS.premium.features.slice(0, 5).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 프리미엄+ */}
          <Card
            className={cn(
              "cursor-pointer transition-all",
              selectedPlan === "premium_plus"
                ? "ring-2 ring-primary"
                : "hover:border-primary/50"
            )}
            onClick={() => setSelectedPlan("premium_plus")}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  프리미엄+
                  <Badge variant="premium">BEST</Badge>
                </CardTitle>
                {selectedPlan === "premium_plus" && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold">
                  {premiumPlusPrice.toLocaleString()}원
                </span>
                <span className="text-muted-foreground">
                  /{billingPeriod === "monthly" ? "월" : "년"}
                </span>
              </div>
              {billingPeriod === "yearly" && (
                <p className="text-sm text-muted-foreground">
                  월{" "}
                  {Math.round(premiumPlusPrice / 12).toLocaleString()}
                  원 (연간 결제)
                </p>
              )}
              <ul className="mt-4 space-y-2">
                {SUBSCRIPTION_PLANS.premium_plus.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.section>

        {/* 기능 비교 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-semibold mb-4">기능 비교</h2>
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-3 text-center text-sm font-medium border-b">
                <div className="p-3">기능</div>
                <div className="p-3 bg-muted/30">무료</div>
                <div className="p-3 bg-primary/10">프리미엄</div>
              </div>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 text-center text-sm border-b last:border-0"
                >
                  <div className="p-3 text-left">
                    <div className="flex items-center gap-2">
                      {feature.icon}
                      <span className="font-medium">{feature.title}</span>
                    </div>
                  </div>
                  <div className="p-3 text-muted-foreground bg-muted/30">
                    {feature.free}
                  </div>
                  <div className="p-3 text-primary font-medium bg-primary/10">
                    {feature.premium}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.section>

        {/* 결제 버튼 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pb-20"
        >
          <Button
            size="xl"
            className="w-full"
            variant="gradient"
            onClick={handleSubscribe}
          >
            {selectedPlan === "premium" ? "프리미엄" : "프리미엄+"} 시작하기
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-3">
            언제든 취소 가능 · 7일 무료 체험
          </p>
        </motion.section>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pb-8"
        >
          <h2 className="font-semibold mb-4">자주 묻는 질문</h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium">언제든 취소할 수 있나요?</p>
              <p className="text-sm text-muted-foreground mt-1">
                네, 언제든 취소할 수 있습니다. 취소 후에도 결제 기간 끝까지
                이용하실 수 있습니다.
              </p>
            </div>
            <div>
              <p className="font-medium">무료 체험은 어떻게 작동하나요?</p>
              <p className="text-sm text-muted-foreground mt-1">
                첫 7일은 무료로 모든 프리미엄 기능을 이용하실 수 있습니다. 7일
                이내에 취소하시면 결제되지 않습니다.
              </p>
            </div>
            <div>
              <p className="font-medium">결제는 안전한가요?</p>
              <p className="text-sm text-muted-foreground mt-1">
                네, 모든 결제는 Stripe을 통해 안전하게 처리됩니다. 카드 정보는
                저희 서버에 저장되지 않습니다.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
