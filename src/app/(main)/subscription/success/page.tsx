"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import confetti from "canvas-confetti";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // 결제 성공 시 confetti 효과
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: Math.random() - 0.2,
        },
        colors: ["#8B5CF6", "#A78BFA", "#C4B5FD", "#34D399", "#FCD34D"],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 세션 ID가 있으면 결제 확인 (선택적)
    if (sessionId) {
      setIsVerified(true);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/10 to-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="text-center">
          <CardContent className="pt-10 pb-8 space-y-6">
            {/* 성공 아이콘 */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="w-20 h-20 rounded-full gradient-primary mx-auto flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            {/* 타이틀 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-2xl font-bold mb-2">
                프리미엄 시작을 축하해요!
              </h1>
              <p className="text-muted-foreground">
                이제 모든 프리미엄 기능을 이용하실 수 있어요
              </p>
            </motion.div>

            {/* 혜택 목록 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-muted/50 rounded-xl p-4 text-left space-y-3"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm">무제한 AI 대화</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm">100+ 명상 프로그램</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm">CBT 도구 전체 접근</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm">수면 프로그램</span>
              </div>
            </motion.div>

            {/* CTA 버튼 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <Link href="/home" className="block">
                <Button size="xl" className="w-full" variant="gradient">
                  시작하기
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/explore" className="block">
                <Button variant="outline" size="lg" className="w-full">
                  명상 프로그램 둘러보기
                </Button>
              </Link>
            </motion.div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          결제 관련 문의는{" "}
          <a href="mailto:support@moodpal.app" className="underline">
            support@moodpal.app
          </a>
          으로 연락해주세요
        </p>
      </motion.div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">로딩 중...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
