// src/components/custom/Header.tsx
"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import SearchBar from "@/components/custom/SearchBar";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signout } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import FullScreenLoading from "@/components/FullScreenLoading";
import { ThemeToggle } from "@/components/custom/ThemeToggle";
import { format } from "date-fns";
import ButtonGenerateIdea from "@/components/dashboard/ButtonGenerateIdea";

export default function Header() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const result = await signout();
    if (result.success) {
      router.push("/login");
      router.refresh();
    } else {
      alert("Logout failed: " + (result.error || "Unknown error"));
      setIsSigningOut(false);
    }
  };

  return (
    <>
      {isSigningOut && <FullScreenLoading text="Logout ..." />}
      <header className="px-8 py-4 border-b border-border">
        <div className="flex items-center justify-between gap-6">
          <Image
            alt="logo"
            src={
              resolvedTheme === "dark" ? "/hadelogowhite.png" : "/hadelogo.png"
            }
            width={100}
            height={32}
          />
          <div className="flex-1 flex justify-center items-center gap-4">
            <SearchBar />
            <ButtonGenerateIdea />
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{today}</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-3 cursor-pointer">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback>
                        {user?.user_metadata?.full_name?.charAt(0) ||
                          user?.email?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-70 p-4" align="end">
                  <div className="flex flex-col items-center py-2 mb-4">
                    <div className="relative">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback>
                          {user?.user_metadata?.full_name?.slice(0, 2) ||
                            user?.email?.slice(0, 2)?.toUpperCase() ||
                            "US"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-1 right-1 block h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
                    </div>
                    <p className="font-bold mt-3 text-center">
                      {user?.user_metadata?.full_name || user?.email || "Guest"}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="p-4 cursor-pointer"
                    onClick={() => router.push("/settings")}
                  >
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="p-4 cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
