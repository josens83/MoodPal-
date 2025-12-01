"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  User,
  Star,
  Video,
  Phone,
  MessageCircle,
  Clock,
  Calendar,
  Shield,
  Award,
  ChevronRight,
  Search,
  Filter,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/components/layout/Header";
import { useUserStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const SPECIALIZATIONS = [
  "전체",
  "우울/불안",
  "대인관계",
  "직장스트레스",
  "자존감",
  "수면",
  "분노조절",
];

const THERAPISTS = [
  {
    id: "t1",
    name: "김서연",
    title: "임상심리전문가",
    photo: null,
    credentials: ["임상심리전문가", "정신건강임상심리사 1급"],
    specializations: ["우울/불안", "대인관계", "자존감"],
    sessionTypes: ["video", "voice", "chat"],
    pricing: { video: 80000, voice: 60000, chat: 50000 },
    rating: 4.9,
    reviewCount: 128,
    bio: "10년 이상의 임상 경험으로 따뜻하고 전문적인 상담을 제공합니다.",
    availability: "오늘 가능",
  },
  {
    id: "t2",
    name: "박준영",
    title: "상담심리전문가",
    photo: null,
    credentials: ["상담심리전문가", "가족상담전문가"],
    specializations: ["직장스트레스", "분노조절", "대인관계"],
    sessionTypes: ["video", "voice"],
    pricing: { video: 70000, voice: 50000 },
    rating: 4.8,
    reviewCount: 95,
    bio: "직장인의 마음 건강을 위한 실질적인 솔루션을 함께 찾아드립니다.",
    availability: "내일 가능",
  },
  {
    id: "t3",
    name: "이하늘",
    title: "정신건강의학과 전문의",
    photo: null,
    credentials: ["정신건강의학과 전문의", "의학박사"],
    specializations: ["우울/불안", "수면", "ADHD"],
    sessionTypes: ["video"],
    pricing: { video: 120000 },
    rating: 4.9,
    reviewCount: 215,
    bio: "전문적인 진단과 치료를 통해 근본적인 회복을 돕습니다.",
    availability: "이번 주 가능",
  },
];

export default function TherapistPage() {
  const { user } = useUserStore();
  const isPremium = user?.plan === "premium" || user?.plan === "premium_plus";
  const [selectedSpec, setSelectedSpec] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTherapists = THERAPISTS.filter((therapist) => {
    if (selectedSpec !== "전체" && !therapist.specializations.includes(selectedSpec)) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        therapist.name.toLowerCase().includes(query) ||
        therapist.specializations.some((s) => s.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen">
      <Header title="전문가 상담" showLogo={false} showSettings />

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* 안내 배너 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-teal-500" />
                </div>
                <div>
                  <h2 className="font-semibold mb-1">검증된 전문가</h2>
                  <p className="text-sm text-muted-foreground">
                    모든 상담사는 자격증을 보유한 전문가입니다.
                    비밀이 보장되는 안전한 환경에서 상담받으세요.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 검색 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="전문가 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.section>

        {/* 전문 분야 필터 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {SPECIALIZATIONS.map((spec) => (
              <Button
                key={spec}
                variant={selectedSpec === spec ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSpec(spec)}
                className="shrink-0"
              >
                {spec}
              </Button>
            ))}
          </div>
        </motion.section>

        {/* 전문가 목록 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredTherapists.map((therapist, index) => (
            <motion.div
              key={therapist.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Card className="card-hover overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar className="w-16 h-16 rounded-xl">
                      <AvatarImage src={therapist.photo || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg rounded-xl">
                        {therapist.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{therapist.name}</p>
                        <Badge variant="secondary" className="text-[10px]">
                          {therapist.title}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm mb-2">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span>{therapist.rating}</span>
                        </div>
                        <span className="text-muted-foreground">
                          리뷰 {therapist.reviewCount}개
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {therapist.specializations.map((spec) => (
                          <span
                            key={spec}
                            className="text-xs px-2 py-0.5 bg-muted rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {therapist.bio}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {therapist.sessionTypes.includes("video") && (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <Video className="w-4 h-4" />
                            </div>
                          )}
                          {therapist.sessionTypes.includes("voice") && (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <Phone className="w-4 h-4" />
                            </div>
                          )}
                          {therapist.sessionTypes.includes("chat") && (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <MessageCircle className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-teal-500 font-medium">
                            {therapist.availability}
                          </p>
                          <p className="text-sm font-semibold">
                            {Math.min(...Object.values(therapist.pricing)).toLocaleString()}원~
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isPremium ? (
                    <Button className="w-full mt-4">예약하기</Button>
                  ) : (
                    <div className="mt-4 flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          프리미엄+ 전용 서비스
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
            </motion.div>
          ))}

          {filteredTherapists.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">검색 결과가 없어요</p>
            </div>
          )}
        </motion.section>

        {/* 전문가 등록 안내 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-muted/50">
            <CardContent className="p-5 text-center">
              <Award className="w-10 h-10 mx-auto text-primary mb-3" />
              <p className="font-semibold mb-1">전문가이신가요?</p>
              <p className="text-sm text-muted-foreground mb-3">
                MoodPal과 함께 더 많은 내담자를 만나보세요
              </p>
              <Button variant="outline">전문가 등록 문의</Button>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
