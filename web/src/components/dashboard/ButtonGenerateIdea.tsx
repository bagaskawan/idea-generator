// src/components/dashboard/ButtonGenerateIdea.tsx
"use client";

import Link from "next/link"; // <-- Impor Link
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

export default function ButtonGenerateIdea() {
  return (
    <div className="flex items-center gap-4">
      <Link href="/idea/new">
        <Button className="p-6 rounded-full">
          <Plus className="w-5 h-5 mr-2" />
          Create your idea
        </Button>
      </Link>
      <Link href="/idea/generate">
        <Button className="p-6 rounded-full" variant="outline">
          <Sparkles className="w-5 h-5 mr-2" />
          Get Idea from AI
        </Button>
      </Link>
    </div>
  );
}
