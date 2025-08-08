"use client";

import { useEffect, useState } from "react";
import { Grid3X3, LogOut, Kanban, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import useUser from "@/hooks/useUser";
import { signout } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/custom/SearchBar";
import Navbar from "@/components/custom/Navbar";

export default function Home() {
  const sidebarItems = [
    { icon: Grid3X3, label: "Dashboard" },
    { icon: Kanban, label: "Projects" },
    { icon: Settings, label: "Settings" },
  ];
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
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="px-12 py-8">
        <Navbar />
      </header>

      <div className="flex flex-1">
        <div className="ml-6 flex w-20 flex-col items-center py-6">
          <div className="flex flex-grow items-center">
            <div className="flex w-full flex-col items-center space-y-6 rounded-4xl bg-zinc-800 py-6 p-2">
              {sidebarItems.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 text-gray-400 transition-colors hover:bg-zinc-700 hover:text-white rounded-full"
                >
                  <item.icon className="h-5 w-5" />
                </Button>
              ))}
            </div>
          </div>
          <Button
            variant="default"
            size="icon"
            className="h-12 w-12 text-gray-400 bg-zinc-700 text-white rounded-full transition-transform duration-300 ease-in-out hover:scale-110"
            onClick={handleSignOut}
            disabled={isLoggingOut}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">{/* Content Area */}</div>
      </div>
    </div>
  );
}
