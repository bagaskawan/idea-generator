// src/app/(dashboard)/idea/generate/page.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import GenerateIdeaForm from "@/components/forms/GenerateIdeaForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Plus,
  CornerUpLeft,
  Lightbulb,
  Code,
  Target,
  Footprints,
  ListChecks,
} from "lucide-react";
import { addIdea } from "@/lib/idea-actions";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import {
  getMainGoal,
  getUserFlow,
  getMvpFeatures,
  parseTechStack,
} from "@/lib/markdown-parser";

// Tipe data untuk hasil ide dari AI
interface GeneratedIdea {
  name: string;
  description: string;
}

export default function GenerateIdeaDisplay() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, startSavingTransition] = useTransition();
  const [generatedIdea, setGeneratedIdea] = useState<GeneratedIdea | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk memanggil API generator
  const handleGenerateIdea = async (interest: string) => {
    setIsLoading(true);
    setError(null);
    setGeneratedIdea(null);

    try {
      const response = await fetch("/api/generate-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interest }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate idea from API.");
      }

      const idea: GeneratedIdea = await response.json();
      setGeneratedIdea(idea);
    } catch (err: any) {
      setError(err.message);
      toast.error("Generation Failed", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk menyimpan ide ke database
  const handleSaveIdea = () => {
    if (!generatedIdea) return;

    const formData = new FormData();
    formData.append("title", generatedIdea.name);
    formData.append("description", generatedIdea.description);

    startSavingTransition(async () => {
      const result = await addIdea(formData);
      if (result.success) {
        toast.success("Idea saved successfully!");
        router.push("/dashboard");
      } else {
        toast.error("Failed to save idea", { description: result.error });
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      {!generatedIdea ? (
        // Tampilan Awal: Tampilkan Form
        <GenerateIdeaForm onSubmit={handleGenerateIdea} isLoading={isLoading} />
      ) : (
        // Tampilan Hasil: Tampilkan Ide yang Dihasilkan
        <>
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {generatedIdea.name}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              AI has generated a project blueprint for you. Review the details
              below and save it to your collection.
            </p>
          </div>
          {/* Description */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Kolom Kiri: Kartu Tujuan & Alur Pengguna */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    1. Main Application Goal
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert">
                  {/* Di sini Anda perlu mem-parsing bagian "Tujuan Utama" dari markdown */}
                  <ReactMarkdown>
                    {getMainGoal(generatedIdea.description)}
                  </ReactMarkdown>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Footprints className="w-5 h-5 text-primary" />
                    2. How It Works (User Flow)
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert">
                  {/* Di sini Anda perlu mem-parsing bagian "Cara Kerja" dari markdown */}
                  <ReactMarkdown>
                    {getUserFlow(generatedIdea.description)}
                  </ReactMarkdown>
                </CardContent>
              </Card>
            </div>

            {/* Kolom Kanan: Kartu Fitur & Tech Stack */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-primary" />
                    3. MVP Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert">
                  {/* Di sini Anda perlu mem-parsing bagian "Fitur MVP" dari markdown */}
                  <ReactMarkdown>
                    {getMvpFeatures(generatedIdea.description)}
                  </ReactMarkdown>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" />
                    4. Recommended Tech Stack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Parsing bagian Tech Stack dan render dengan Badge untuk tampilan lebih menarik */}
                  <div className="space-y-2">
                    {parseTechStack(generatedIdea.description).map((tech) => (
                      <div key={tech.name}>
                        <Badge variant="secondary">{tech.name}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {tech.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Button */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleSaveIdea}
              disabled={isSaving}
              size="lg"
              className="w-full sm:w-auto py-6 text-base"
            >
              <Plus className="w-5 h-5 mr-2" />
              Save to Collection
            </Button>
            <Button
              variant="ghost"
              onClick={() => setGeneratedIdea(null)}
              disabled={isSaving}
              size="lg"
              className="w-full sm:w-auto py-6 text-base"
            >
              <CornerUpLeft className="w-5 h-5 mr-2" />
              Generate Another
            </Button>
          </div>
        </>
      )}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
}
