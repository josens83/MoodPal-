"use client";

import { motion } from "framer-motion";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/5 to-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <Card>
          <CardContent className="pt-10 pb-8 space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center">
                <WifiOff className="w-10 h-10 text-muted-foreground" />
              </div>
            </motion.div>

            <div>
              <h1 className="text-xl font-bold mb-2">인터넷 연결 없음</h1>
              <p className="text-muted-foreground">
                인터넷에 연결되어 있지 않아요.
                <br />
                연결을 확인하고 다시 시도해주세요.
              </p>
            </div>

            <Button
              onClick={handleRetry}
              className="gap-2"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </Button>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                오프라인에서도 이용 가능한 기능:
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <span className="px-3 py-1 bg-muted rounded-full">
                  저장된 명상
                </span>
                <span className="px-3 py-1 bg-muted rounded-full">
                  기분 기록
                </span>
                <span className="px-3 py-1 bg-muted rounded-full">
                  호흡 운동
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
