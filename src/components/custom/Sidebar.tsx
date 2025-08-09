// src/components/custom/Sidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Grid3X3, Kanban, Settings } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";

const sidebarItems = [
  { href: "/dashboard", icon: Grid3X3, label: "Dashboard" },
  { href: "/idea", icon: Kanban, label: "Projects" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border">
      <div className="flex items-center justify-center h-20 border-b border-border">
        <Image
          alt="logo"
          src={
            resolvedTheme === "dark" ? "/hadelogowhite.png" : "/hadelogo.png"
          }
          width={120}
          height={40}
        />
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => (
          <Link href={item.href} key={item.label}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <item.icon className="mr-4 h-5 w-5" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
    </aside>
  );
}