// src/components/forms/GenerateIdeaForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";

interface GenerateIdeaFormProps {
  onSubmit: (interest: string) => Promise<void>;
}

export default function GenerateIdeaForm({ onSubmit }: GenerateIdeaFormProps) {
  const [interest, setInterest] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interest.trim() || isLoading) return;

    setIsLoading(true);
    await onSubmit(interest);
    setIsLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center text-center">
      <div className="p-3 bg-primary/10 rounded-full mb-4">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">
        Let AI be your creative partner
      </h2>
      <p className="text-muted-foreground mb-8">
        Masukkan bidang minat atau teknologi yang ingin Anda eksplorasi. AI akan
        membuatkan ide proyek yang unik dan modern untuk Anda.
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-2 text-left">
          <Label htmlFor="interest" className="font-semibold">
            Bidang Minat Proyek (contoh: IoT, Edukasi, Kesehatan)
          </Label>
          <Input
            id="interest"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            placeholder="e.g., 'Aplikasi edukasi untuk anak'"
            className="h-12 text-base"
            disabled={isLoading}
            autoFocus
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isLoading || !interest.trim()}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5 mr-2" />
          )}
          {isLoading ? "Generating..." : "Generate Idea"}
        </Button>
      </form>
    </div>
  );
}
