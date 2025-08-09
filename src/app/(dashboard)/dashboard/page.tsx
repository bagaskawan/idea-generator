"use client";

import {
  Sparkles,
  LayoutDashboard,
  BarChart3,
  Settings,
  Shield,
} from "lucide-react";

import { useEffect } from "react";
import useUser from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import DashboardCMS from "@/components/dashboard/Dashboard";

export default function DashboardPage() {
  const { user, loading: isUserLoading, error: userError } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  return <DashboardCMS />;
}
