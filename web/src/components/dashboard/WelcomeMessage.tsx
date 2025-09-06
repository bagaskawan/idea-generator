"use client";

import useUser from "@/hooks/useUser";
import { Skeleton } from "@/components/ui/skeleton";

export default function WelcomeMessage() {
  const { user, loading } = useUser();
  const displayName = user?.user_metadata?.full_name || user?.email;

  if (loading) {
    return (
      <div className="w-full py-10 flex justify-between items-center">
        <div>
          <Skeleton className="h-16 w-80 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>
      </div>
    );
  }

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
