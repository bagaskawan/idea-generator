"use client";

import {
  Sparkles,
  LayoutDashboard,
  BarChart3,
  Settings,
  Shield,
  Search,
  Bell,
  User,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import useUser from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { signout } from "@/lib/auth-actions";
import DashboardCMS from "@/components/dashboard/Dashboard";

const navItems = [
  { name: "DASHBOARD", icon: LayoutDashboard },
  { name: "Analytics", icon: BarChart3 },
  { name: "Settings", icon: Settings },
  { name: "Security", icon: Shield },
];

const activeItem = "DASHBOARD";

export default function DashboardPage() {
  const { user, loading: isUserLoading, error: userError } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    const result = await signout();
    if (result.success) {
      router.push("/login");
      router.refresh();
    } else {
      alert("Logout failed: " + result.error);
      setIsLoggingOut(false);
    }
    // await signout();
  };
  return (
    // Latar belakang utama halaman
    <DashboardCMS />
  );
}
