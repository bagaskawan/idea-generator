import React from "react";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({
  weight: ["700", "800"],
  subsets: ["latin"],
});
export function HeaderLogin() {
  return (
    <div>
      <h1
        className={cn(
          "text-5xl font-extrabold leading-[1.1] text-[#393E46]",
          inter.className
        )}
      >
        Yes, your unfair <span className="text-[#A62C2C]">Youtube</span>{" "}
        advantage exists. Ideate, optimize, and dominate your niche.
      </h1>
    </div>
  );
}
