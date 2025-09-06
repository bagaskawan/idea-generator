"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", url: "/dashboard" },
  { name: "Projects", url: "/idea" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="ml-8 flex items-center space-x-1 p-1 rounded-full">
      {navItems.map((item) => (
        <Link href={item.url} key={item.name}>
          <Button
            variant={pathname === item.url ? "default" : "ghost"}
            size="sm"
            className="rounded-full p-6"
          >
            {item.name}
          </Button>
        </Link>
      ))}
    </nav>
  );
}
