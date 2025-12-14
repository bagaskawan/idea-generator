"use client";

import { useEffect, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";

interface ChatContainerProps {
  children: ReactNode;
  className?: string;
}

export function ChatContainer({ children, className }: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [children]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
        className
      )}
    >
      <div className="max-w-4xl mx-auto">
        {children}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

interface DateSeparatorProps {
  date: Date;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  const getDateLabel = () => {
    if (isToday(date)) return "TODAY";
    if (isYesterday(date)) return "YESTERDAY";
    return format(date, "MMMM d, yyyy").toUpperCase();
  };

  return (
    <div className="flex items-center justify-center my-6">
      <div className="flex items-center gap-3">
        <div className="h-px bg-border flex-1 w-12"></div>
        <span className="text-xs font-medium text-muted-foreground tracking-wider">
          {getDateLabel()}
        </span>
        <div className="h-px bg-border flex-1 w-12"></div>
      </div>
    </div>
  );
}
