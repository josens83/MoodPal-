"use client";

import { Bell, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
  showNotifications?: boolean;
  showSettings?: boolean;
  user?: {
    name?: string;
    image?: string;
    plan?: string;
  };
}

export function Header({
  title,
  showLogo = true,
  showNotifications = true,
  showSettings = false,
  user,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-lg border-b safe-top">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {showLogo && (
            <Link href="/home" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                MoodPal
              </span>
            </Link>
          )}
          {title && !showLogo && (
            <h1 className="text-lg font-semibold">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user?.plan === "premium" && (
            <Badge variant="premium" className="text-[10px] px-2 py-0.5">
              PRO
            </Badge>
          )}

          {showNotifications && (
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/notifications">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
              </Link>
            </Button>
          )}

          {showSettings && (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <Settings className="w-5 h-5" />
              </Link>
            </Button>
          )}

          {user && (
            <Link href="/profile">
              <Avatar className="w-8 h-8 border-2 border-primary/20">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {user.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
