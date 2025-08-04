"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import GenerateIdeaModal from "./GenerateIdeaModal"; // Import the new modal
import { cn } from "@/lib/utils";

interface IdeaFormProps {
  formData: {
    name: string;
    description: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
    }>
  >;
  errors: { [key: string]: string };
  handleSubmit: (e: React.FormEvent) => void;
}

export default function IdeaForm({
  formData,
  setFormData,
  errors,
  handleSubmit,
}: IdeaFormProps) {
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null); // State for error messages

  const handleGenerate = async (interest: string) => {
    setIsGenerating(true);
    setGenerationError(null); // Clear previous errors
    try {
      const response = await fetch("/api/generate-idea", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ interest }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate idea");
      }

      const idea = await response.json();
      setFormData({ name: idea.name, description: idea.description });
      setIsGenerateModalOpen(false); // Close modal on success
    } catch (error: unknown) {
      console.error("Error generating idea:", error);
      if (error instanceof Error) {
        setGenerationError(error.message);
      } else {
        setGenerationError("An unknown error occurred.");
      }
      setIsGenerateModalOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Card className="h-fit border-none shadow-none bg-transparent">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            &nbsp;
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setGenerationError(null); // Clear error on manual input
                }}
                className={cn(
                  "transition-all duration-200 focus:ring-2 focus:ring-blue-500/20",
                  errors.name &&
                    "border-red-500 focus:ring-red-500/20 rounded-xs"
                )}
                placeholder="Enter Your Ide ..."
                disabled={isGenerating}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  setGenerationError(null); // Clear error on manual input
                }}
                className={cn(
                  "min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 resize-none rounded-xs",
                  errors.description && "border-red-500 focus:ring-red-500/20"
                )}
                disabled={isGenerating}
                placeholder="Tell me how the idea came about? ..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" className="flex-1">
                Add Idea
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsGenerateModalOpen(true)} // Open the modal
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Get Idea from AI
              </Button>
            </div>
            {/* Display Generation Error Here */}
            {generationError && (
              <p className="text-red-500 text-sm font-semibold">
                Error: {generationError}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Render the modal */}
      <GenerateIdeaModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerate={handleGenerate}
        isLoading={isGenerating}
      />
    </>
  );
}
