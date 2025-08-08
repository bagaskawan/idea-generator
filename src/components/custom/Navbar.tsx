"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Sun } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-6 ml-auto">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="w-8 h-8 text-gray-600" />
          </Button>

          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src="https://cdn.dribbble.com/users/4636531/avatars/normal/open-uri20200104-18489-1lxfo4c?1578133435" />
              <AvatarFallback>KV</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  );
}
