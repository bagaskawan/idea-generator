"use client";

import useUser from "@/hooks/useUser";
import { Hand } from "lucide-react";

export default function WelcomeMessage() {
  const { user } = useUser();
  const displayName = user?.user_metadata?.full_name || user?.email;

  return (
    <div className="w-full py-10 flex justify-between items-center">
      <div>
        <h2 className="text-6xl font-bold tracking-tight">
          Hi, {displayName || "Guest"}!
        </h2>
        <p className="text-md mt-4">
          Let&apos;s turn your brilliant ideas into real projects today.
        </p>
      </div>
    </div>
  );
}
