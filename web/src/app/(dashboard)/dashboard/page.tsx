"use client";

import { useEffect } from "react";
import useUser from "@/hooks/api/useUser";
import { useRouter } from "next/navigation";
import Dashboard from "@/components/modules/dashboard/Dashboard";

export default function DashboardPage() {
  const { user, loading: isUserLoading, error: userError } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  return <Dashboard />;
}
