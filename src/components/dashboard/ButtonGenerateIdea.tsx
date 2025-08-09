// src/components/custom/ButtonGenerateIdea.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

interface ButtonGenerateIdeaProps {
  onGenerateAIIdeaClick: () => void;
}

export default function ButtonGenerateIdea({
  onGenerateAIIdeaClick,
}: ButtonGenerateIdeaProps) {
  const router = useRouter();

  return (
    <div className="flex items-center space-x-4">
      {/* Tombol Create Your Idea */}
      <Button
        size="lg"
        className="p-6 rounded-full"
        onClick={() => router.push("/idea")}
      >
        <Plus className="w-5 h-5 mr-2" />
        Create your idea
      </Button>

      {/* Tombol Get Idea from AI */}
      <Button
        size="lg"
        className="p-6 rounded-full"
        variant="outline"
        onClick={onGenerateAIIdeaClick}
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Get Idea from AI
      </Button>
    </div>
  );
}
