"use client";

import * as React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Maximize, Minimize } from "lucide-react";

export type ExpandingTextareaProps = React.ComponentPropsWithoutRef<
  typeof TextareaAutosize
>;

const ExpandingTextarea = React.forwardRef<
  HTMLTextAreaElement,
  ExpandingTextareaProps
>(({ className, ...props }, ref) => {
  const internalRef = React.useRef<HTMLTextAreaElement>(null);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [showIcon, setShowIcon] = React.useState(false);

  // Menggabungkan ref eksternal dan internal
  React.useImperativeHandle(ref, () => internalRef.current!);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const checkHeight = () => {
    if (internalRef.current) {
      const textarea = internalRef.current;
      // Mendapatkan line-height dari computed style
      const computedStyle = window.getComputedStyle(textarea);
      const lineHeight = parseFloat(computedStyle.lineHeight);
      // Menghitung tinggi untuk 3 baris
      const heightOfThreeLines = lineHeight * 3;

      // Tampilkan ikon jika tinggi scroll lebih dari 3 baris
      if (textarea.scrollHeight > heightOfThreeLines) {
        setShowIcon(true);
      } else {
        setShowIcon(false);
      }
    }
  };

  return (
    <div
      className={cn(
        "relative w-full",
        isFullScreen &&
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      )}
    >
      <div className={cn("w-full", isFullScreen && "max-w-4xl")}>
        <div className="relative">
          {/* --- PERBAIKAN ADA DI BARIS INI --- */}
          <TextareaAutosize
            className={cn(
              "w-full rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none",
              // Menambahkan max-h-[80vh] dan overflow-y-auto untuk membatasi tinggi saat fullscreen
              isFullScreen
                ? "min-h-[60vh] max-h-[80vh] overflow-y-auto"
                : "max-h-48 overflow-y-auto", // max-h-48 adalah contoh, bisa disesuaikan
              className
            )}
            ref={internalRef}
            onHeightChange={checkHeight}
            {...props}
          />
          {(isFullScreen || showIcon) && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute bottom-2 right-2 h-8 w-8 text-muted-foreground"
              onClick={toggleFullScreen}
            >
              {isFullScreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle Fullscreen</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});
ExpandingTextarea.displayName = "ExpandingTextarea";

export { ExpandingTextarea };
