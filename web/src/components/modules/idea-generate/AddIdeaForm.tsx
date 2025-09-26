// src/components/forms/AddIdeaForm.tsx
"use client";

import { useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Textarea } from "@/components/shared/ui/textarea";
import { Loader2, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { addIdea } from "@/lib/actions/idea-actions";
import { toast } from "sonner";

export default function AddIdeaForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title.trim() || !description.trim()) {
      toast.error("Both title and description are required.");
      return;
    }

    startTransition(async () => {
      const result = await addIdea(formData);
      if (result.success) {
        toast.success("Idea added successfully!", {
          description: "Your new idea has been saved to your collection.",
        });
        router.push("/dashboard");
      } else {
        toast.error("Failed to add idea", {
          description: result.error || "An unexpected error occurred.",
        });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto mt-32 flex flex-col items-center text-center">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Capture Your Next Big Idea
        </h1>
        <p className="mt-3 text-md text-muted-foreground">
          very great project starts with a single thought. What&apos;s on your
          mind?
        </p>
      </div>

      <form
        ref={formRef}
        key={isPending ? "pending" : "ready"}
        onSubmit={handleSubmit}
        className="w-full space-y-8"
      >
        <div>
          <Input
            id="title"
            name="title"
            placeholder="e.g., 'AI-Powered Workout Planner'"
            className="h-14 px-4 text-lg focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-50"
            disabled={isPending}
            autoFocus
          />
        </div>

        <div>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe your idea in a few sentences. What problem does it solve? Who is it for?"
            className="min-h-[300px] p-4 text-base rounded-sm resize-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-50"
            disabled={isPending}
          />
        </div>

        <div className="flex flex-col items-center gap-4 pt-2">
          <Button
            type="submit"
            className="w-full font-medium rounded-full py-6"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Add Idea to Collection
              </>
            )}
          </Button>

          <div className="text-sm w-full">
            <Link href="/idea/generate" className="w-full">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="px-2 py-6 rounded-full w-full border-dashed hover:border-solid hover:border-primary transition-all duration-300"
                disabled={isPending}
              >
                <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                Let AI generate an idea for you
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
