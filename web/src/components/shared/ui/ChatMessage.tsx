"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

export function ChatMessage({
  role,
  content,
  timestamp,
  isThinking = false,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-3 px-4 py-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
          <span className="text-white text-sm font-semibold">AI</span>
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn("flex flex-col gap-2 max-w-[70%]", isUser && "items-end")}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 transition-all duration-300",
            isUser
              ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
              : "bg-card border border-border text-foreground"
          )}
        >
          {isThinking ? (
            <div className="flex items-center gap-1 py-1">
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
            </div>
          ) : (
            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          )}
        </div>
        <span className="text-xs text-muted-foreground px-1">
          {format(timestamp, "HH:mm")}
        </span>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-500 dark:to-gray-600 flex items-center justify-center">
          <span className="text-white text-sm font-semibold">Me</span>
        </div>
      )}
    </div>
  );
}
