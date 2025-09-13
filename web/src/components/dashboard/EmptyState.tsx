// src/components/dashboard/EmptyState.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

export default function EmptyState() {
  const router = useRouter();

  return (
    <div className="text-center py-20 rounded-lg flex flex-col items-center">
      <Lightbulb className="w-16 h-16 text-zinc-700 mb-4" strokeWidth={1} />
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Let&apos;s Create Your First Brilliant Idea!
      </h2>
      <p className="max-w-md mx-auto text-muted-foreground mb-6">
        Your dashboard is currently empty. Start by adding a new idea manually
        or let our AI generate one for you.
      </p>
      <Button size="lg" onClick={() => router.push("/idea/generate")}>
        Create an Idea
      </Button>
    </div>
  );
}
