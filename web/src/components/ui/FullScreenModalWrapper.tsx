// src/components/ui/FullScreenModalWrapper.tsx
"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { ThemeToggle } from "@/components/custom/ThemeToggle";
import ButtonX from "./button-x";
import Link from "next/link";

interface FullScreenModalWrapperProps {
  children: React.ReactNode;
}

export function FullScreenModalWrapper({
  children,
}: FullScreenModalWrapperProps) {
  const router = useRouter();

  return (
    <div className="w-full mx-auto ">
      <Link href="/dashboard">
        <div className="bg-foreground h-10 px-4 sm:px-6 lg:px-8 sticky top-0 z-10 flex justify-end mb-8 cursor-pointer">
          <ButtonX className="text-primary-foreground" />
        </div>
      </Link>
      <div className="pt-8">{children}</div>
      <div className="fixed bottom-4 left-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
