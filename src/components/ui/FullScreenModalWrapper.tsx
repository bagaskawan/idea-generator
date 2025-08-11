// src/components/ui/FullScreenModalWrapper.tsx
"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface FullScreenModalWrapperProps {
  children: React.ReactNode;
}

export function FullScreenModalWrapper({
  children,
}: FullScreenModalWrapperProps) {
  const router = useRouter();

  return (
    <div className="w-full mx-auto ">
      <div
        onClick={() => router.back()}
        className="bg-zinc-800 px-4 sm:px-6 lg:px-8 sticky top-0 z-10 flex justify-end mb-8 cursor-pointer"
      >
        <button className="rounded-full text-primary-foreground p-2">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="py-8">{children}</div>
    </div>
  );
}
