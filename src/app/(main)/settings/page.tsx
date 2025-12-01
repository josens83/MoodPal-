"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Clock,
  Smartphone,
  Volume2,
  Trash2,
  Download,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Header } from "@/components/layout/Header";
import { useUserStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const REMINDER_TIMES = [
  { id: "morning", label: "아침 (8:00)", time: "08:00" },
  { id: "afternoon", label: "오후 (14:00)", time: "14:00" },
  { id: "evening", label: "저녁 (20:00)", time: "20:00" },
  { id: "none", label: "받지 않음", time: null },
];

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { preferences, updatePreferences, logout } = useUserStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleLogout = async () => {
    logout();
    await signOut({ redirect: false });
    router.push("/");
  };

  const SettingItem = ({
    icon: Icon,
    label,
    description,
    action,
    onClick,
    danger,
  }: {
    icon: any;
    label: string;
    description?: string;
    action?: React.ReactNode;
    onClick?: () => void;
    danger?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg",
        danger && "text-destructive"
      )}
      disabled={!onClick}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            danger ? "bg-destructive/10" : "bg-muted"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className="font-medium">{label}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action || (onClick && <ChevronRight className="w-5 h-5 text-muted-foreground" />)}
    </button>
  );

  return (
    <div className="min-h-screen">
      <Header title="설정" showLogo={false} />

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* 알림 설정 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">알림</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <SettingItem
                icon={Bell}
                label="푸시 알림"
                description="앱 알림 받기"
                action={
                  <Switch
                    checked={preferences.notificationEnabled}
                    onCheckedChange={(checked) =>
                      updatePreferences({ notificationEnabled: checked })
                    }
                  />
                }
              />
              <SettingItem
                icon={Clock}
                label="체크인 리마인더"
                description={
                  preferences.checkInReminder
                    ? REMINDER_TIMES.find(
                        (t) => t.id === preferences.checkInReminder
                      )?.label
                    : "받지 않음"
                }
                onClick={() => {}}
              />
            </CardContent>
          </Card>
        </motion.section>

        {/* 앱 설정 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">앱 설정</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <SettingItem
                icon={theme === "dark" ? Moon : Sun}
                label="다크 모드"
                description={theme === "dark" ? "켜짐" : "꺼짐"}
                action={
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) =>
                      setTheme(checked ? "dark" : "light")
                    }
                  />
                }
              />
              <SettingItem
                icon={Volume2}
                label="명상 음량"
                description="기본"
                onClick={() => {}}
              />
              <SettingItem
                icon={Globe}
                label="언어"
                description="한국어"
                onClick={() => {}}
              />
            </CardContent>
          </Card>
        </motion.section>

        {/* 데이터 관리 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">데이터</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <SettingItem
                icon={Download}
                label="내 데이터 다운로드"
                description="감정 기록, 대화 내역"
                onClick={() => {}}
              />
              <SettingItem
                icon={Trash2}
                label="데이터 삭제"
                description="모든 기록 영구 삭제"
                onClick={() => setShowDeleteDialog(true)}
                danger
              />
            </CardContent>
          </Card>
        </motion.section>

        {/* 지원 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">지원</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <SettingItem
                icon={HelpCircle}
                label="도움말"
                onClick={() => {}}
              />
              <SettingItem
                icon={Mail}
                label="문의하기"
                description="support@moodpal.app"
                onClick={() => {}}
              />
              <SettingItem
                icon={Shield}
                label="개인정보처리방침"
                onClick={() => {}}
              />
              <SettingItem
                icon={FileText}
                label="이용약관"
                onClick={() => {}}
              />
            </CardContent>
          </Card>
        </motion.section>

        {/* 계정 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">계정</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <SettingItem
                icon={LogOut}
                label="로그아웃"
                onClick={() => setShowLogoutDialog(true)}
                danger
              />
            </CardContent>
          </Card>
        </motion.section>

        {/* 버전 정보 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground py-4"
        >
          <p>MoodPal v1.0.0</p>
          <p className="mt-1">Made with 💜 for your mental health</p>
        </motion.section>
      </div>

      {/* 로그아웃 확인 */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>로그아웃</DialogTitle>
            <DialogDescription>
              정말 로그아웃 하시겠어요?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowLogoutDialog(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleLogout}
            >
              로그아웃
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 데이터 삭제 확인 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              데이터 삭제
            </DialogTitle>
            <DialogDescription>
              모든 감정 기록, 대화 내역, 설정이 영구적으로 삭제됩니다.
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteDialog(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                // 데이터 삭제 처리
                setShowDeleteDialog(false);
              }}
            >
              삭제하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
