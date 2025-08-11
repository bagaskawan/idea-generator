// src/components/dashboard/Dashboard.tsx
"use client";

import { useEffect } from "react";
import useUser from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import Header from "@/components/custom/Header";
import MainContent from "@/components/dashboard/MainContent";
import WelcomeMessage from "@/components/dashboard/WelcomeMessage";
import FullScreenLoading from "@/components/FullScreenLoading";
import { useIdeaManager } from "@/utils/useIdeaManager";

export default function Dashboard() {
  const { user, loading: userLoading } = useUser();
  const { data: ideas, isLoading: ideasLoading } = useIdeaManager();

  const router = useRouter();

  const isLoading = userLoading || ideasLoading;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return <FullScreenLoading text="Preparing your dashboard..." />;
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          <WelcomeMessage />
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              Your Ideas
            </h2>
            <MainContent projects={ideas} />
          </div>
        </main>
      </div>
    </div>
  );
}
