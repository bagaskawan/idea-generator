"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/shared/ui/button";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  centered?: boolean;
  autoFocus?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "Type your message...",
  centered = false,
  autoFocus = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  // Auto-focus when mounted
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  return (
    <div
      className={cn(
        "w-full transition-all duration-500",
        centered ? "max-w-3xl mx-auto" : "max-w-4xl mx-auto"
      )}
    >
      <div
        className={cn(
          "relative border border-border transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/20",
          centered && "shadow-2xl"
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className={cn(
            "w-full px-4 py-3 pr-12 bg-transparent resize-none outline-none text-sm md:text-base",
            "placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed",
            "max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
          )}
        />
        <Button
          type="button"
          size="icon"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="absolute right-2 bottom-2 h-8 w-8 rounded-lg"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {!centered && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Press{" "}
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Enter</kbd> to
          send,{" "}
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">
            Shift + Enter
          </kbd>{" "}
          for new line
        </p>
      )}
    </div>
  );
}
