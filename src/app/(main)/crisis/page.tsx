"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, MessageCircle, Heart, ChevronLeft, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CRISIS_RESOURCES } from "@/lib/constants";

export default function CrisisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-destructive/5 to-background">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-lg border-b safe-top">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto">
          <Link href="/home">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="flex-1 text-center font-semibold">위기 지원</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* 경고 배너 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/20 mx-auto flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold mb-2">지금 힘드신가요?</h2>
              <p className="text-muted-foreground">
                당신은 혼자가 아닙니다.
                <br />
                전문 상담사가 24시간 도움을 드릴 수 있어요.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* 긴급 연락처 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-semibold mb-3">긴급 연락처</h2>
          <div className="space-y-3">
            {CRISIS_RESOURCES.map((resource, index) => (
              <motion.div
                key={resource.number}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <a href={`tel:${resource.number}`}>
                  <Card className="card-hover">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{resource.name}</p>
                        <p className="text-lg font-bold text-primary">
                          {resource.number}
                        </p>
                        {resource.description && (
                          <p className="text-xs text-muted-foreground">
                            {resource.description}
                          </p>
                        )}
                      </div>
                      <Button size="icon" className="shrink-0">
                        <Phone className="w-5 h-5" />
                      </Button>
                    </CardContent>
                  </Card>
                </a>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 추가 리소스 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-semibold mb-3">추가 리소스</h2>
          <div className="space-y-3">
            <Card className="card-hover">
              <CardContent className="p-4">
                <a
                  href="https://www.mhw.go.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-teal-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">정신건강복지센터</p>
                    <p className="text-sm text-muted-foreground">
                      전국 정신건강 서비스 안내
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </a>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-4">
                <a
                  href="https://www.kocw.net/home/index.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">온라인 심리상담</p>
                    <p className="text-sm text-muted-foreground">
                      비대면 상담 서비스
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </a>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* 즉각적인 도움 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-semibold mb-3">지금 할 수 있는 것</h2>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">호흡에 집중하기</p>
                  <p className="text-sm text-muted-foreground">
                    4초 들이쉬고, 4초 내쉬기를 반복해보세요.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">안전한 곳으로 이동</p>
                  <p className="text-sm text-muted-foreground">
                    지금 있는 곳이 안전한지 확인하세요.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">누군가에게 연락하기</p>
                  <p className="text-sm text-muted-foreground">
                    가족, 친구, 또는 위의 상담 전화로 연락하세요.
                  </p>
                </div>
              </div>

              <Link href="/explore/sos-3min-breathing">
                <Button className="w-full mt-2" variant="outline">
                  3분 호흡 명상 시작하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.section>

        {/* AI 대화 유도 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 text-primary" />
              <p className="font-medium mb-2">AI 친구와 대화하기</p>
              <p className="text-sm text-muted-foreground mb-4">
                전문 상담 전, 마음을 정리하고 싶다면
                <br />
                하나와 이야기해보세요.
              </p>
              <Link href="/chat">
                <Button>대화 시작하기</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.section>

        {/* 면책 조항 */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pb-8"
        >
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            MoodPal은 전문 의료 서비스가 아닙니다.
            <br />
            긴급한 상황에서는 반드시 전문 상담 전화를 이용하세요.
            <br />
            생명의 위협을 느끼는 경우 119에 연락하세요.
          </p>
        </motion.section>
      </div>
    </div>
  );
}
