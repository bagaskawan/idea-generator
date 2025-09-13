"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  CornerUpLeft,
  Sparkles,
  Lightbulb,
  FileText,
  Users,
  BarChart3,
  Wrench,
  ChevronRight,
} from "lucide-react";
import { addIdea } from "@/lib/idea-actions";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { IconMapper } from "@/components/styles/IconMapper";

// Import khusus untuk Blocknote read-only
import { BlockNoteView } from "@blocknote/mantine";
import { useBlocknoteEditor } from "@/hooks/detail-idea/useBlocknoteEditor";
import { useBlocknoteTheme } from "@/hooks/detail-idea/useBlockNoteTheme";
import "@blocknote/mantine/style.css";
import "@blocknote/react/style.css";
import "@blocknote/xl-ai/style.css";

// Tipe untuk menyimpan setiap giliran percakapan
interface ConversationTurn {
  question: string;
  answer: string;
}

// Tipe untuk hasil akhir blueprint dari AI
interface GeneratedBlueprint {
  projectData: {
    title: string;
    problem_statement: string;
    target_audience: { icon: string; text: string }[];
    success_metrics: { type: string; text: string }[];
    tech_stack: string[];
  };
  workbenchContent: string;
}

type InterviewStep = "initial" | "interviewing" | "generating" | "result";

export default function GenerateIdeaDisplay() {
  const router = useRouter();
  const [step, setStep] = useState<InterviewStep>("initial");
  const [interest, setInterest] = useState("");
  const [conversationHistory, setConversationHistory] = useState<
    ConversationTurn[]
  >([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [generatedBlueprint, setGeneratedBlueprint] =
    useState<GeneratedBlueprint | null>(null);
  const [isSaving, startSavingTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  // Inisialisasi editor Blocknote untuk mode read-only di halaman hasil
  const editor = useBlocknoteEditor();
  const theme = useBlocknoteTheme();

  // Efek untuk memuat konten Markdown ke editor saat blueprint sudah siap
  useEffect(() => {
    if (step === "result" && generatedBlueprint && editor) {
      const loadContent = async () => {
        const blocks = await editor.tryParseMarkdownToBlocks(
          generatedBlueprint.workbenchContent
        );
        editor.replaceBlocks(editor.topLevelBlocks, blocks);
      };
      loadContent();
    }
  }, [step, generatedBlueprint, editor]);

  // Fungsi untuk memulai wawancara
  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interest.trim()) return;
    setIsLoading(true);
    setStep("interviewing");

    try {
      const response = await fetch("/api/ai/start-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interest }),
      });

      if (!response.ok) throw new Error("Failed to start the interview.");

      const data = await response.json();
      setCurrentQuestion(data.question);
    } catch (err: any) {
      toast.error("Error", { description: err.message });
      setStep("initial");
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk melanjutkan wawancara
  const handleContinueInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnswer.trim()) {
      toast.error("Please provide an answer.");
      return;
    }

    setIsLoading(true);
    const newHistory: ConversationTurn[] = [
      ...conversationHistory,
      { question: currentQuestion, answer: currentAnswer },
    ];
    setConversationHistory(newHistory);
    setCurrentAnswer("");

    if (newHistory.length >= 3) {
      setStep("generating");
      try {
        const res = await fetch("/api/ai/generate-idea", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interest, conversation: newHistory }),
        });
        if (!res.ok) throw new Error("Failed to generate the blueprint.");

        const blueprint = await res.json();
        setGeneratedBlueprint(blueprint);
        setStep("result");
      } catch (err: any) {
        toast.error("Error generating blueprint", { description: err.message });
        setStep("interviewing");
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const res = await fetch("/api/ai/continue-interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interest, history: newHistory }),
        });
        if (!res.ok) throw new Error("Failed to get the next question.");

        const data = await res.json();
        setCurrentQuestion(data.question);
      } catch (err: any) {
        toast.error("Error", { description: err.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Fungsi untuk menyimpan hasil
  const handleSaveIdea = () => {
    if (!generatedBlueprint) return;

    startSavingTransition(async () => {
      const result = await addIdea(generatedBlueprint);
      if (result.success && result.projectId) {
        toast.success("Blueprint saved successfully!");
        router.push(`/idea/${result.projectId}`);
      } else {
        toast.error("Failed to save blueprint", { description: result.error });
      }
    });
  };

  // --- RENDER LOGIC (UI) ---

  if (step === "generating") {
    return (
      <div className="text-center max-w-2xl mx-auto mt-32">
        <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4 animate-pulse">
          <Lightbulb className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">AI is architecting...</h2>
        <p className="text-muted-foreground mt-2">
          Crafting a complete blueprint based on your answers. This might take a
          moment.
        </p>
        <div className="space-y-4 mt-8">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (step === "result" && generatedBlueprint) {
    const { projectData } = generatedBlueprint;
    const kuantitatifMetrics = projectData.success_metrics.filter(
      (m) => m.type === "Kuantitatif"
    );
    const kualitatifMetrics = projectData.success_metrics.filter(
      (m) => m.type === "Kualitatif"
    );

    return (
      <div className="space-y-8 animate-in fade-in-50 mt-20 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {projectData.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Your project blueprint is ready. Review the details below and save
            it to your collection.
          </p>
        </div>

        {/* Bagian Data Terstruktur */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="col-span-1 md:col-span-2 border-none shadow-none bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Problem Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {projectData.problem_statement}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-none bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Target Audience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {projectData.target_audience.map((audience, index) => (
                <div key={index} className="flex items-start gap-3">
                  <IconMapper
                    iconName={audience.icon}
                    className="w-5 h-5 text-muted-foreground mt-1"
                  />
                  <span className="text-muted-foreground">{audience.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-none bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Success Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {kuantitatifMetrics.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-foreground">
                    Kuantitatif
                  </h4>
                  <ul className="space-y-2">
                    {kuantitatifMetrics.map((metric, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-muted-foreground"
                      >
                        <ChevronRight className="w-4 h-4 mt-1 shrink-0" />{" "}
                        <span>{metric.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {kualitatifMetrics.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-foreground">
                    Kualitatif
                  </h4>
                  <ul className="space-y-2">
                    {kualitatifMetrics.map((metric, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-muted-foreground"
                      >
                        <ChevronRight className="w-4 h-4 mt-1 shrink-0" />{" "}
                        <span>{metric.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-none bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              Tech Stack
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {projectData.tech_stack.map((tech, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-base px-3 py-1"
              >
                {tech}
              </Badge>
            ))}
          </CardContent>
        </Card>

        {/* PERBAIKAN: Menggunakan Blocknote untuk merender Workbench Content */}
        <div className="rounded-lg bg-card/50 p-2">
          {editor && (
            <BlockNoteView editor={editor} editable={false} theme={theme} />
          )}
        </div>

        {/* Tombol Aksi */}
        <div className="py-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleSaveIdea}
            disabled={isSaving}
            size="lg"
            className="w-full sm:w-auto py-6 text-base rounded-full"
          >
            <Plus className="w-5 h-5 mr-2" /> Save to Collection
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setStep("initial");
              setConversationHistory([]);
            }}
            disabled={isSaving}
            size="lg"
            className="w-full sm:w-auto py-6 text-base rounded-full"
          >
            <CornerUpLeft className="w-5 h-5 mr-2" /> Generate Another
          </Button>
        </div>
      </div>
    );
  }

  if (step === "interviewing") {
    return (
      <Card className="max-w-2xl mx-auto mt-32 border-0 shadow-none animate-in fade-in-50">
        <CardHeader>
          <CardTitle>
            AI Interview ({conversationHistory.length + 1}/3)
          </CardTitle>
          <CardDescription className="pt-2 text-base">
            {isLoading ? "Thinking of the next question..." : currentQuestion}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleContinueInterview} className="space-y-4">
            <Textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              autoFocus
              placeholder="Your answer..."
              className="min-h-[120px] text-base resize-none"
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="rounded-full py-6 w-full"
              disabled={isLoading}
            >
              {isLoading
                ? "Processing..."
                : conversationHistory.length >= 2
                ? "Generate Blueprint"
                : "Next Question"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Initial Step
  return (
    <Card className="max-w-2xl mt-32 mx-auto border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">
          Let AI be Your Creative Partner
        </CardTitle>
        <CardDescription className="text-md text-muted-foreground pt-2">
          Start by entering a field of interest. The AI will then conduct a
          brief, dynamic interview to generate a tailored project blueprint for
          you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleStartInterview} className="w-full space-y-6 pt-4">
          <Input
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            placeholder="e.g., 'Educational app for children'"
            className="h-14 px-4 text-lg"
            disabled={isLoading}
            autoFocus
          />
          <Button
            type="submit"
            size="lg"
            className="w-full font-medium rounded-full py-6"
            disabled={isLoading}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Interview
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
