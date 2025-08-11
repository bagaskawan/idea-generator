// src/components/forms/AddIdeaForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PlusCircle, Sparkles } from "lucide-react";
import Link from "next/link";

interface AddIdeaFormProps {
  onSubmit: (title: string, description: string) => Promise<void>;
}

export default function AddIdeaForm({ onSubmit }: AddIdeaFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onSubmit(title, description);
    } catch (error) {
      console.error("Error submitting idea:", error);
      // Anda bisa menambahkan notifikasi error untuk pengguna di sini
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-32 flex flex-col items-center text-center">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Capture Your Next Big Idea
        </h1>
        <p className="mt-3 text-md text-muted-foreground">
          Every great project starts with a single thought. What&apos;s on your
          mind?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-8">
        <div className="">
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., 'AI-Powered Workout Planner'"
            className="h-14 px-4 text-lg focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-50"
            disabled={isLoading}
            autoFocus
          />
        </div>

        <div className="">
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your idea in a few sentences. What problem does it solve? Who is it for?"
            className="min-h-[200px] p-4 text-base rounded-sm resize-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-50"
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button type="submit" className="flex-1">
            Add Idea
          </Button>
          <Link href="/idea/generate" className="flex-1">
            <Button type="button" variant="outline">
              <Sparkles className="w-4 h-4 mr-2" />
              Get Idea from AI
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
