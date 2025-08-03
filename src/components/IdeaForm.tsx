"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface IdeaFormProps {
  formData: {
    name: string;
    description: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{ name: string; description: string }>
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
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGetIdeaFromAI = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-idea", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate idea from AI.");
      }

      const data = await response.json();
      setFormData({
        name: data.name || "",
        description: data.description || "",
      });
    } catch (error) {
      console.error(error);
      alert("Gagal mendapatkan ide dari AI. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
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
              placeholder="Masukkan Ide..."
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className={cn(
                "transition-all duration-200 focus:ring-2 focus:ring-blue-500/20",
                errors.name && "border-red-500 focus:ring-red-500/20 rounded-xs"
              )}
              disabled={isGenerating}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Textarea
              id="description"
              placeholder="Ceritakan bagaimana idenya?"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className={cn(
                "min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 resize-none rounded-xs",
                errors.description && "border-red-500 focus:ring-red-500/20"
              )}
              disabled={isGenerating}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              type="submit"
              className="flex-1 bg-gray-800 text-gray-50 hover:bg-gray-900 rounded-sm transition-all duration-200 shadow-md hover:shadow-lg"
              size="lg"
              disabled={isGenerating}
            >
              Tambah Ide
            </Button>
            <Button
              type="button"
              onClick={handleGetIdeaFromAI}
              disabled={isGenerating}
              className="flex-1 bg-gray-200 text-gray-900 hover:bg-gray-300 rounded-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isGenerating ? "Generating..." : "Dapatkan Ide dari AI ✨"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
