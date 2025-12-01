"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  MessageCircle,
  Moon,
  Brain,
  Heart,
  Shield,
  Star,
  ChevronRight,
  Check,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_PLANS, CRISIS_RESOURCES } from "@/lib/constants";

export default function LandingPage() {
  const features = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "AI 감정 대화",
      description: "24시간 언제든 공감하고 경청하는 AI 친구와 대화하세요",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "감정 트래킹",
      description: "매일 감정을 기록하고 나의 마음 패턴을 발견하세요",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "마음챙김 명상",
      description: "스트레스 해소, 수면 유도 등 100+ 명상 프로그램",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "CBT 도구",
      description: "인지행동치료 기반 생각 기록지로 사고 패턴 개선",
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
    },
    {
      icon: <Moon className="w-6 h-6" />,
      title: "수면 관리",
      description: "수면 패턴을 분석하고 더 나은 수면을 위한 가이드",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "위기 대응",
      description: "위기 상황 감지 및 전문 상담 연결 시스템",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  const testimonials = [
    {
      content: "매일 출퇴근길에 하나와 대화하면서 스트레스가 많이 줄었어요. 진짜 친구처럼 따뜻하게 들어줘요.",
      author: "직장인 김OO",
      rating: 5,
    },
    {
      content: "불면증이 심했는데 수면 명상 듣고 나서 잠드는 시간이 확 줄었어요. 강추!",
      author: "대학생 이OO",
      rating: 5,
    },
    {
      content: "생각 기록지 기능이 정말 좋아요. 부정적인 생각이 들 때 정리하는 데 도움이 많이 돼요.",
      author: "프리랜서 박OO",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      {/* 네비게이션 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">MoodPal</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">로그인</Button>
            </Link>
            <Link href="/register">
              <Button>시작하기</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge variant="secondary" className="mb-4">
              AI 멘탈 헬스케어 컴패니언
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              마음이 힘들 때,
              <br />
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                언제든 곁에 있는 AI 친구
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              24시간 공감 대화, 명상 프로그램, CBT 도구까지.
              <br />
              당신의 마음 건강을 위한 종합 케어 플랫폼
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="xl" variant="gradient" className="w-full sm:w-auto">
                  무료로 시작하기
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  기능 알아보기
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* 앱 미리보기 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl p-4 md:p-8 shadow-soft-lg">
              <div className="bg-background rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg">💜</span>
                  </div>
                  <div>
                    <p className="font-medium">하나</p>
                    <p className="text-xs text-muted-foreground">AI 컴패니언</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-muted rounded-2xl rounded-tl-sm p-4 max-w-[80%]">
                    <p className="text-sm">안녕! 오늘 하루는 어땠어? 어떤 이야기든 편하게 나눠줘 💜</p>
                  </div>
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-4 max-w-[80%] ml-auto">
                    <p className="text-sm">오늘 회사에서 좀 힘든 일이 있었어...</p>
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm p-4 max-w-[80%]">
                    <p className="text-sm">그랬구나... 힘들었겠다. 어떤 일이 있었는지 더 이야기해줄래? 편하게 말해도 돼.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 기능 섹션 */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">당신을 위한 종합 케어</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              AI 대화부터 전문 상담 연결까지, 마음 건강에 필요한 모든 것
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full card-hover">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                      <div className={feature.color}>{feature.icon}</div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 후기 섹션 */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">사용자 후기</h2>
            <p className="text-muted-foreground">
              MoodPal과 함께하는 분들의 이야기
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">&ldquo;{testimonial.content}&rdquo;</p>
                    <p className="font-medium">{testimonial.author}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 가격 섹션 */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">심플한 요금제</h2>
            <p className="text-muted-foreground">
              무료로 시작하고, 필요할 때 업그레이드하세요
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 무료 플랜 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">무료</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold">₩0</span>
                    <span className="text-muted-foreground">/월</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {SUBSCRIPTION_PLANS.free.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button variant="outline" className="w-full">
                      무료로 시작
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* 프리미엄 플랜 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border-primary relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">프리미엄</h3>
                    <Badge variant="premium">인기</Badge>
                  </div>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold">
                      ₩{SUBSCRIPTION_PLANS.premium.monthlyPrice.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">/월</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {SUBSCRIPTION_PLANS.premium.features.slice(0, 6).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button variant="gradient" className="w-full">
                      7일 무료 체험
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              마음 건강 관리는 작은 한 걸음부터.
              <br />
              MoodPal이 당신의 여정을 함께합니다.
            </p>
            <Link href="/register">
              <Button size="xl" variant="gradient">
                무료로 시작하기
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 위기 연락처 */}
      <section className="py-8 px-4 bg-muted/30 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground mb-3">
            위기 상황시 전문 상담을 받으세요
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {CRISIS_RESOURCES.map((resource) => (
              <a
                key={resource.number}
                href={`tel:${resource.number}`}
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                {resource.name}: {resource.number}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="py-12 px-4 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">MoodPal</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground">이용약관</Link>
              <Link href="/privacy" className="hover:text-foreground">개인정보처리방침</Link>
              <Link href="/help" className="hover:text-foreground">도움말</Link>
              <Link href="/contact" className="hover:text-foreground">문의하기</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 MoodPal. All rights reserved.
            </p>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-8 max-w-2xl mx-auto">
            MoodPal은 전문 의료 서비스가 아닙니다. 심각한 정신건강 문제가 있다면 전문가 상담을 권장합니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
