"use client";

import { useEffect } from "react";
import useUser from "@/hooks/useUser";
import { signout } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";
import Header from "@/components/custom/Header";
import Sidebar from "@/components/custom/Sidebar";
import MainContent from "@/components/dashboard/MainContent";
import WelcomeMessage from "@/components/dashboard/WelcomeMessage";
import ButtonGenerateIdea from "@/components/dashboard/ButtonGenerateIdea";

export default function Home() {
  const { user, loading: isUserLoading, error: userError } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <WelcomeMessage />
          <MainContent />
        </main>
      </div>
    </div>
  );
}
