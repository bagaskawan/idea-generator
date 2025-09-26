// src/components/forms/GenerateIdeaForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { toast } from "sonner";

interface GenerateIdeaFormProps {
  onSubmit: (interest: string) => void;
  isLoading: boolean;
}

export default function GenerateIdeaForm({
  onSubmit,
  isLoading,
}: GenerateIdeaFormProps) {
  const [interest, setInterest] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (!interest.trim()) {
      toast.error("Interest form are required.");
      return;
    }
    onSubmit(interest);
  };

  return (
    <Card className="max-w-2xl mt-32 mx-auto border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">
          Let AI be Your Creative Partner
        </CardTitle>
        <CardDescription className="text-md text-muted-foreground pt-2">
          Enter a field of interest or a technology you'd like to explore. The
          AI will generate a unique project idea for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="w-full space-y-6 pt-4">
          <div className="space-y-2 text-left">
            <Input
              id="interest"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="e.g., 'Educational app for children'"
              className="h-14 px-4 text-lg focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-50"
              disabled={isLoading}
              autoFocus
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full font-medium rounded-full py-6"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 mr-2" />
            )}
            {isLoading ? "Generating..." : "Generate Idea"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
