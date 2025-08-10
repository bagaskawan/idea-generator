"use client";

import useUser from "@/hooks/useUser";
import { Hand } from "lucide-react";

export default function WelcomeMessage() {
  const { user } = useUser();
  const displayName = user?.user_metadata?.full_name || user?.email;

  return (
    <div className="w-full p-10 flex justify-between items-center">
      <div>
        <h2 className="text-5xl font-bold tracking-tight">
          Hi, {displayName || "Guest"}!
        </h2>
        <p className="text-xl font-semibold mt-1"></p>
        <p className="text-sm opacity-80 mt-2">
          Let&apos;s turn your brilliant ideas into real projects today.
        </p>
      </div>
    </div>
  );
}
