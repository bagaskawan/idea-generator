"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface GeneratingAnimationProps {
  texts: string[];
  className?: string;
  period?: number;
}

export const GeneratingAnimation = ({
  texts,
  className,
  period = 2500,
}: GeneratingAnimationProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (texts.length <= 1) return;

    const interval = setInterval(() => {
      setIsFading(true);
      // Tunggu transisi fade-out selesai sebelum mengganti teks
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
        setIsFading(false);
      }, 500);
    }, period);

    return () => clearInterval(interval);
  }, [texts.length, period]);

  return (
    <div
      className={cn(
        "transition-opacity duration-500",
        isFading ? "opacity-0" : "opacity-100",
        className
      )}
    >
      {texts[currentIndex]}
    </div>
  );
};
