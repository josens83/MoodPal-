"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Phone, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversationStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { CRISIS_RESOURCES } from "@/lib/constants";
import { Message } from "@/types";

export function ChatInterface() {
  const {
    companion,
    messages,
    isLoading,
    isCrisisMode,
    addMessage,
    setLoading,
    setCrisisMode,
    startConversation,
  } = useConversationStore();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 대화 시작
  useEffect(() => {
    if (messages.length === 0) {
      startConversation();
    }
  }, []);

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID?.() || `${Date.now()}`,
      role: "user",
      content: input.trim(),
      createdAt: new Date(),
    };

    addMessage(userMessage);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          messages: messages,
          companionId: companion.id,
        }),
      });

      const data = await response.json();

      if (data.isCrisis) {
        setCrisisMode(true);
      }

      const companionMessage: Message = {
        id: crypto.randomUUID?.() || `${Date.now()}-companion`,
        role: "companion",
        content: data.message,
        emotionAnalysis: data.emotionAnalysis,
        isCrisisMessage: data.isCrisis,
        createdAt: new Date(),
      };

      addMessage(companionMessage);

      // 활동 추천이 있으면 추가 메시지
      if (data.suggestedActivity && !data.isCrisis) {
        setTimeout(() => {
          const activityMessage: Message = {
            id: crypto.randomUUID?.() || `${Date.now()}-activity`,
            role: "companion",
            content: `💡 ${data.suggestedActivity.title}는 어때요? ${data.suggestedActivity.description}`,
            createdAt: new Date(),
          };
          addMessage(activityMessage);
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID?.() || `${Date.now()}-error`,
        role: "companion",
        content: "미안해요, 잠시 문제가 생겼어요. 다시 말해줄래요?",
        createdAt: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 위기 상황 배너 */}
      <AnimatePresence>
        {isCrisisMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-destructive/10 border-b border-destructive/20"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-destructive text-sm">
                    전문 상담이 도움이 될 수 있어요
                  </p>
                  <div className="mt-2 space-y-1">
                    {CRISIS_RESOURCES.map((resource) => (
                      <a
                        key={resource.number}
                        href={`tel:${resource.number}`}
                        className="flex items-center gap-2 text-sm hover:underline"
                      >
                        <Phone className="w-4 h-4" />
                        {resource.name}: {resource.number}
                      </a>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCrisisMode(false)}
                >
                  닫기
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 컴패니언 헤더 */}
      <div className="flex items-center gap-3 p-4 border-b bg-background/80 backdrop-blur-sm">
        <Avatar className="w-10 h-10 border-2 border-primary/20">
          <AvatarImage src={companion.avatar} alt={companion.name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {companion.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium">{companion.name}</p>
          <p className="text-xs text-muted-foreground">{companion.description}</p>
        </div>
        <Sparkles className="w-5 h-5 text-primary animate-pulse-soft" />
      </div>

      {/* 메시지 영역 */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-lg mx-auto">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              companion={companion}
              showTimestamp={
                index === 0 ||
                message.createdAt.getTime() -
                  messages[index - 1].createdAt.getTime() >
                  60000
              }
            />
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={companion.avatar} alt={companion.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {companion.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <span
                    className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* 입력 영역 */}
      <div className="p-4 border-t bg-background/80 backdrop-blur-sm safe-bottom">
        <div className="flex items-end gap-2 max-w-lg mx-auto">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-11 w-11 shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  companion,
  showTimestamp,
}: {
  message: Message;
  companion: { name: string; avatar: string };
  showTimestamp: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}
    >
      {!isUser && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={companion.avatar} alt={companion.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {companion.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col gap-1 max-w-[80%]",
          isUser && "items-end"
        )}
      >
        {showTimestamp && (
          <span className="text-[10px] text-muted-foreground px-2">
            {formatRelativeTime(message.createdAt)}
          </span>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : message.isCrisisMessage
              ? "bg-destructive/10 border border-destructive/20 rounded-tl-sm"
              : "bg-muted rounded-tl-sm"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </motion.div>
  );
}
