"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Clock,
  Heart,
  Share2,
  ChevronLeft,
  Lock,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useUserStore, useMeditationPlayerStore } from "@/lib/store";
import { MEDITATION_PROGRAMS } from "@/lib/constants";
import { getCategoryLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function MeditationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUserStore();
  const {
    isPlaying,
    currentProgramId,
    progress,
    duration,
    setPlaying,
    setProgram,
    setProgress,
    reset,
  } = useMeditationPlayerStore();

  const isPremium = user?.plan === "premium" || user?.plan === "premium_plus";

  const program = MEDITATION_PROGRAMS.find((p) => p.id === params.id);
  const isLocked = program?.accessType === "premium" && !isPremium;
  const isCurrentProgram = currentProgramId === params.id;

  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && isCurrentProgram) {
      intervalRef.current = setInterval(() => {
        setProgress(Math.min(progress + 1, duration));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isCurrentProgram, progress, duration, setProgress]);

  useEffect(() => {
    if (progress >= duration && duration > 0) {
      setPlaying(false);
    }
  }, [progress, duration, setPlaying]);

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">프로그램을 찾을 수 없습니다</p>
      </div>
    );
  }

  const handlePlay = () => {
    if (isLocked) {
      router.push("/subscription");
      return;
    }

    if (!isCurrentProgram) {
      setProgram(program.id, program.duration * 60);
    }
    setPlaying(!isPlaying);
    setShowPlayer(true);
  };

  const handleSeek = (value: number[]) => {
    setProgress(value[0]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart
                className={cn(
                  "w-5 h-5",
                  isLiked && "fill-red-500 text-red-500"
                )}
              />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* 썸네일 및 정보 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <button
              onClick={handlePlay}
              className={cn(
                "relative z-10 w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg transition-transform hover:scale-105",
                isLocked && "bg-muted"
              )}
            >
              {isLocked ? (
                <Lock className="w-8 h-8 text-muted-foreground" />
              ) : isPlaying && isCurrentProgram ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </button>
          </div>
        </motion.section>

        {/* 제목 및 설명 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">
                  {getCategoryLabel(program.category)}
                </Badge>
                {program.accessType === "premium" && (
                  <Badge variant="premium">PRO</Badge>
                )}
              </div>
              <h1 className="text-xl font-bold">{program.title}</h1>
            </div>
          </div>

          <p className="text-muted-foreground">{program.description}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {program.duration}분
            </span>
            <span>{program.instructor}</span>
            <Badge variant="outline" className="text-xs">
              {program.difficulty === "beginner"
                ? "초급"
                : program.difficulty === "intermediate"
                ? "중급"
                : "고급"}
            </Badge>
          </div>
        </motion.section>

        {/* 잠금 안내 */}
        {isLocked && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
              <CardContent className="p-5 text-center">
                <Lock className="w-10 h-10 mx-auto text-primary mb-3" />
                <p className="font-semibold mb-2">프리미엄 콘텐츠</p>
                <p className="text-sm text-muted-foreground mb-4">
                  프리미엄으로 업그레이드하고
                  <br />
                  100개 이상의 명상을 무제한으로 즐기세요
                </p>
                <Link href="/subscription">
                  <Button variant="gradient">프리미엄 시작하기</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* 효과 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="font-semibold">기대 효과</h2>
          <div className="flex flex-wrap gap-2">
            {program.benefits.map((benefit) => (
              <span
                key={benefit}
                className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
              >
                {benefit}
              </span>
            ))}
          </div>
        </motion.section>

        {/* 플레이어 (시작 후 표시) */}
        {showPlayer && isCurrentProgram && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-20 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t"
          >
            <div className="max-w-lg mx-auto space-y-4">
              {/* 프로그레스 바 */}
              <div className="space-y-2">
                <Slider
                  value={[progress]}
                  max={duration}
                  step={1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* 컨트롤 */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setProgress(Math.max(0, progress - 15))}
                >
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button
                  size="icon"
                  className="w-14 h-14 rounded-full"
                  onClick={() => setPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setProgress(Math.min(duration, progress + 15))}
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              {/* 볼륨 */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={([v]) => {
                    setVolume(v);
                    setIsMuted(v === 0);
                  }}
                  className="flex-1"
                />
              </div>
            </div>
          </motion.section>
        )}

        {/* 관련 프로그램 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h2 className="font-semibold">비슷한 프로그램</h2>
          <div className="space-y-3">
            {MEDITATION_PROGRAMS.filter(
              (p) => p.category === program.category && p.id !== program.id
            )
              .slice(0, 3)
              .map((p) => (
                <Link key={p.id} href={`/explore/${p.id}`}>
                  <Card className="card-hover">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{p.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {p.duration}분 · {p.instructor}
                        </p>
                      </div>
                      {p.accessType === "premium" && !isPremium && (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
