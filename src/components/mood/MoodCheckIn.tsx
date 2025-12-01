"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMoodCheckInStore, useTodayStore } from "@/lib/store";
import { EMOTIONS, BODY_FEELINGS, ACTIVITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Emotion } from "@/types";

// Type for mood check-in data
interface MoodCheckInData {
  primaryMood: Emotion | null;
  secondaryMood: Emotion | null;
  intensity: number;
  bodyFeelings: string[];
  activities: string[];
  note: string;
}

interface StepProps {
  data: MoodCheckInData;
  updateData: (data: Partial<MoodCheckInData>) => void;
}

export function MoodCheckIn() {
  const { isOpen, step, data, closeCheckIn, nextStep, prevStep, updateData, reset } =
    useMoodCheckInStore();
  const { setTodayMood, incrementCheckIn } = useTodayStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!data.primaryMood) return;

    setIsSubmitting(true);
    try {
      // API 호출
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryMood: data.primaryMood,
          secondaryMood: data.secondaryMood,
          intensity: data.intensity,
          bodyFeelings: data.bodyFeelings,
          activities: data.activities,
          note: data.note,
        }),
      });

      if (response.ok) {
        // 상태 업데이트
        setTodayMood({
          primary: data.primaryMood,
          secondary: data.secondaryMood || undefined,
          intensity: data.intensity,
          valence: 0,
          arousal: 5,
        });
        incrementCheckIn();
        reset();
        closeCheckIn();
      }
    } catch (error) {
      console.error("Failed to save mood:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1 data={data} updateData={updateData} />;
      case 2:
        return <Step2 data={data} updateData={updateData} />;
      case 3:
        return <Step3 data={data} updateData={updateData} />;
      case 4:
        return <Step4 data={data} updateData={updateData} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeCheckIn()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-primary/10 to-purple-500/10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">지금 기분이 어때요?</DialogTitle>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    s <= step ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between p-4 border-t bg-muted/30">
          <Button
            variant="ghost"
            onClick={step === 1 ? closeCheckIn : prevStep}
            disabled={isSubmitting}
          >
            {step === 1 ? (
              "취소"
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                이전
              </>
            )}
          </Button>

          {step < 4 ? (
            <Button
              onClick={nextStep}
              disabled={step === 1 && !data.primaryMood}
            >
              다음
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                "저장 중..."
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  완료
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Step 1: 기본 감정 선택
function Step1({ data, updateData }: StepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        가장 가까운 감정을 선택해주세요
      </p>
      <div className="grid grid-cols-4 gap-3">
        {EMOTIONS.map((emotion) => (
          <button
            key={emotion.id}
            onClick={() => updateData({ primaryMood: emotion.id as Emotion })}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
              data.primaryMood === emotion.id
                ? "border-primary bg-primary/10 scale-105"
                : "border-transparent bg-muted/50 hover:bg-muted"
            )}
          >
            <span className="text-2xl">{emotion.emoji}</span>
            <span className="text-xs font-medium">{emotion.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 2: 감정 강도
function Step2({ data, updateData }: StepProps) {
  const selectedEmotion = EMOTIONS.find((e) => e.id === data.primaryMood);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-5xl mb-2 block">{selectedEmotion?.emoji}</span>
        <p className="text-lg font-medium">{selectedEmotion?.label}</p>
        <p className="text-sm text-muted-foreground">얼마나 강하게 느끼나요?</p>
      </div>

      <div className="space-y-4 px-4">
        <Slider
          value={[data.intensity]}
          onValueChange={([value]) => updateData({ intensity: value })}
          min={1}
          max={10}
          step={1}
          className="py-4"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>약하게</span>
          <span className="font-medium text-foreground">{data.intensity}</span>
          <span>강하게</span>
        </div>
      </div>

      <div className="pt-4">
        <p className="text-sm text-muted-foreground mb-3">
          추가로 느끼는 감정이 있나요? (선택)
        </p>
        <div className="flex flex-wrap gap-2">
          {EMOTIONS.filter((e) => e.id !== data.primaryMood)
            .slice(0, 8)
            .map((emotion) => (
              <button
                key={emotion.id}
                onClick={() =>
                  updateData({
                    secondaryMood:
                      data.secondaryMood === emotion.id
                        ? null
                        : (emotion.id as Emotion),
                  })
                }
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-all",
                  data.secondaryMood === emotion.id
                    ? "border-primary bg-primary/10"
                    : "border-muted bg-muted/50 hover:bg-muted"
                )}
              >
                {emotion.emoji} {emotion.label}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

// Step 3: 신체 느낌 & 활동
function Step3({ data, updateData }: StepProps) {
  const toggleBodyFeeling = (id: string) => {
    const current = data.bodyFeelings;
    updateData({
      bodyFeelings: current.includes(id)
        ? current.filter((f) => f !== id)
        : [...current, id],
    });
  };

  const toggleActivity = (id: string) => {
    const current = data.activities;
    updateData({
      activities: current.includes(id)
        ? current.filter((a) => a !== id)
        : [...current, id],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium mb-3">몸에서 느껴지는 것 (선택)</p>
        <div className="flex flex-wrap gap-2">
          {BODY_FEELINGS.map((feeling) => (
            <button
              key={feeling.id}
              onClick={() => toggleBodyFeeling(feeling.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm border transition-all",
                data.bodyFeelings.includes(feeling.id)
                  ? "border-primary bg-primary/10"
                  : "border-muted bg-muted/50 hover:bg-muted"
              )}
            >
              {feeling.icon} {feeling.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-3">지금 뭐 하고 있어요? (선택)</p>
        <div className="flex flex-wrap gap-2">
          {ACTIVITIES.slice(0, 8).map((activity) => (
            <button
              key={activity.id}
              onClick={() => toggleActivity(activity.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm border transition-all",
                data.activities.includes(activity.id)
                  ? "border-primary bg-primary/10"
                  : "border-muted bg-muted/50 hover:bg-muted"
              )}
            >
              {activity.icon} {activity.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 4: 메모
function Step4({ data, updateData }: StepProps) {
  const selectedEmotion = EMOTIONS.find((e) => e.id === data.primaryMood);

  return (
    <div className="space-y-4">
      <div className="text-center p-4 bg-muted/50 rounded-xl">
        <span className="text-4xl mb-2 block">{selectedEmotion?.emoji}</span>
        <p className="font-medium">
          {selectedEmotion?.label} (강도: {data.intensity}/10)
        </p>
        {data.secondaryMood && (
          <p className="text-sm text-muted-foreground">
            + {EMOTIONS.find((e) => e.id === data.secondaryMood)?.label}
          </p>
        )}
      </div>

      <div>
        <p className="text-sm font-medium mb-2">한 줄 메모 (선택)</p>
        <Textarea
          placeholder="오늘의 기분에 대해 더 이야기해주세요..."
          value={data.note}
          onChange={(e) => updateData({ note: e.target.value })}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
}
