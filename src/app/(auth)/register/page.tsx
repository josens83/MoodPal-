"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, User, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUserStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordRequirements = [
    { label: "8자 이상", met: password.length >= 8 },
    { label: "영문 포함", met: /[a-zA-Z]/.test(password) },
    { label: "숫자 포함", met: /[0-9]/.test(password) },
  ];

  const allRequirementsMet = passwordRequirements.every((r) => r.met);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!allRequirementsMet) {
      setError("비밀번호 요구사항을 충족해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: 실제 회원가입 API 호출
      // 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 임시 사용자 설정
      setUser({
        id: "user-new",
        email,
        name,
        plan: "free",
      });

      router.push("/home");
    } catch (err) {
      setError("회원가입에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/5 to-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            MoodPal
          </h1>
          <p className="text-muted-foreground mt-1">
            마음 건강 관리를 시작하세요
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>회원가입</CardTitle>
            <CardDescription>
              무료로 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">이름</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">이메일</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="hello@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">비밀번호</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  {passwordRequirements.map((req) => (
                    <span
                      key={req.label}
                      className={cn(
                        "text-xs px-2 py-1 rounded-full flex items-center gap-1",
                        req.met
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {req.met && <Check className="w-3 h-3" />}
                      {req.label}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading || !allRequirementsMet}
              >
                {isLoading ? "가입 중..." : "회원가입"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="text-primary hover:underline">
                로그인
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          가입하면{" "}
          <Link href="/terms" className="underline">
            이용약관
          </Link>
          과{" "}
          <Link href="/privacy" className="underline">
            개인정보처리방침
          </Link>
          에 동의하게 됩니다.
        </p>
      </motion.div>
    </div>
  );
}
