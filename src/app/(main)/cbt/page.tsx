"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  FileText,
  Target,
  Lightbulb,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Header } from "@/components/layout/Header";
import { useUserStore } from "@/lib/store";
import { COGNITIVE_DISTORTIONS_LIST as COGNITIVE_DISTORTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const CBT_TOOLS = [
  {
    id: "thought-record",
    title: "생각 기록지",
    description: "부정적인 생각을 분석하고 대안적 생각 찾기",
    icon: FileText,
    color: "from-blue-500 to-cyan-500",
    accessType: "free",
  },
  {
    id: "cognitive-distortions",
    title: "인지왜곡 알아보기",
    description: "나의 사고 패턴에서 인지왜곡 발견하기",
    icon: Brain,
    color: "from-purple-500 to-pink-500",
    accessType: "free",
  },
  {
    id: "goal-setting",
    title: "행동 활성화",
    description: "작은 목표 설정으로 활력 되찾기",
    icon: Target,
    color: "from-green-500 to-emerald-500",
    accessType: "premium",
  },
  {
    id: "reframing",
    title: "리프레이밍",
    description: "상황을 다른 관점에서 바라보기",
    icon: Lightbulb,
    color: "from-amber-500 to-orange-500",
    accessType: "premium",
  },
];

export default function CBTPage() {
  const { user } = useUserStore();
  const isPremium = user?.plan === "premium" || user?.plan === "premium_plus";
  const [showThoughtRecord, setShowThoughtRecord] = useState(false);

  return (
    <div className="min-h-screen">
      <Header title="CBT 도구" showLogo={false} showSettings />

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* 소개 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold mb-1">인지행동치료(CBT)란?</h2>
                  <p className="text-sm text-muted-foreground">
                    생각, 감정, 행동의 연결고리를 이해하고
                    부정적인 사고 패턴을 변화시키는 과학적으로 검증된 심리치료 기법이에요.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* CBT 도구 목록 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className="font-semibold">CBT 도구</h2>
          {CBT_TOOLS.map((tool, index) => {
            const Icon = tool.icon;
            const isLocked = tool.accessType === "premium" && !isPremium;

            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card
                  className={cn(
                    "card-hover cursor-pointer overflow-hidden",
                    isLocked && "opacity-60"
                  )}
                  onClick={() => {
                    if (isLocked) {
                      // 프리미엄 업그레이드 안내
                    } else if (tool.id === "thought-record") {
                      setShowThoughtRecord(true);
                    }
                  }}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center relative",
                        tool.color
                      )}
                    >
                      <Icon className="w-7 h-7 text-white" />
                      {isLocked && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{tool.title}</p>
                        {tool.accessType === "premium" && !isPremium && (
                          <Badge variant="premium" className="text-[10px]">
                            PRO
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.section>

        {/* 인지왜곡 목록 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="font-semibold">인지왜곡 유형</h2>
          <div className="grid grid-cols-2 gap-3">
            {COGNITIVE_DISTORTIONS.map((distortion, index) => (
              <motion.div
                key={distortion.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.03 }}
              >
                <Card className="h-full">
                  <CardContent className="p-3">
                    <p className="font-medium text-sm mb-1">{distortion.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {distortion.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 프리미엄 안내 */}
        {!isPremium && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
              <CardContent className="p-5 text-center">
                <p className="font-semibold mb-2">
                  모든 CBT 도구를 사용해보세요
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  프리미엄으로 업그레이드하고 더 많은 도구를 이용하세요
                </p>
                <Link href="/subscription">
                  <Button variant="gradient">프리미엄 시작하기</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.section>
        )}
      </div>

      {/* 생각 기록지 모달 */}
      <ThoughtRecordDialog
        open={showThoughtRecord}
        onOpenChange={setShowThoughtRecord}
      />
    </div>
  );
}

function ThoughtRecordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState(1);
  const [situation, setSituation] = useState("");
  const [emotion, setEmotion] = useState("");
  const [emotionIntensity, setEmotionIntensity] = useState(5);
  const [automaticThought, setAutomaticThought] = useState("");
  const [selectedDistortions, setSelectedDistortions] = useState<string[]>([]);
  const [alternativeThought, setAlternativeThought] = useState("");
  const [newIntensity, setNewIntensity] = useState(5);

  const handleReset = () => {
    setStep(1);
    setSituation("");
    setEmotion("");
    setEmotionIntensity(5);
    setAutomaticThought("");
    setSelectedDistortions([]);
    setAlternativeThought("");
    setNewIntensity(5);
  };

  const toggleDistortion = (id: string) => {
    setSelectedDistortions((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) handleReset();
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            생각 기록지
          </DialogTitle>
          <DialogDescription>
            단계별로 생각을 분석해보세요 ({step}/5)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  1. 상황 설명
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  언제, 어디서, 무슨 일이 있었나요?
                </p>
                <Textarea
                  placeholder="예: 오늘 회의에서 발표를 했는데 실수를 했다..."
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  2. 그때 느낀 감정
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  어떤 감정을 느꼈나요?
                </p>
                <Textarea
                  placeholder="예: 창피함, 불안, 자책감..."
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  감정의 강도 ({emotionIntensity}/10)
                </label>
                <Slider
                  value={[emotionIntensity]}
                  onValueChange={([v]) => setEmotionIntensity(v)}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  3. 자동적 사고
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  그 순간 머릿속에 떠오른 생각은 무엇인가요?
                </p>
                <Textarea
                  placeholder="예: '나는 항상 실수만 해', '다들 나를 무능하다고 생각하겠지'..."
                  value={automaticThought}
                  onChange={(e) => setAutomaticThought(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  4. 인지왜곡 찾기
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  위의 생각에서 발견되는 인지왜곡을 선택하세요
                </p>
                <div className="flex flex-wrap gap-2">
                  {COGNITIVE_DISTORTIONS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => toggleDistortion(d.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs border transition-all",
                        selectedDistortions.includes(d.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted bg-muted/50 hover:bg-muted"
                      )}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  5. 대안적 생각
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  더 균형 잡힌 생각으로 바꿔보세요
                </p>
                <Textarea
                  placeholder="예: '실수는 누구나 한다. 이번 경험으로 다음엔 더 잘할 수 있을 거야'..."
                  value={alternativeThought}
                  onChange={(e) => setAlternativeThought(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  지금 감정의 강도 ({newIntensity}/10)
                </label>
                <Slider
                  value={[newIntensity]}
                  onValueChange={([v]) => setNewIntensity(v)}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={() => {
              if (step === 1) {
                onOpenChange(false);
              } else {
                setStep(step - 1);
              }
            }}
          >
            {step === 1 ? "취소" : "이전"}
          </Button>
          <Button
            onClick={() => {
              if (step === 5) {
                // 완료 처리
                onOpenChange(false);
                handleReset();
              } else {
                setStep(step + 1);
              }
            }}
            disabled={
              (step === 1 && !situation) ||
              (step === 2 && !emotion) ||
              (step === 3 && !automaticThought)
            }
          >
            {step === 5 ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                완료
              </>
            ) : (
              "다음"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
