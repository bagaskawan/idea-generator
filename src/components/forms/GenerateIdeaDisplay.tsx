// src/components/forms/GenerateIdeaDisplay.tsx (COMPLETED)
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, CornerUpLeft, Sparkles, Lightbulb } from "lucide-react";
import { addIdea } from "@/lib/idea-actions";
import { toast } from "sonner";
import {
  getMainGoal,
  getUserFlow,
  getMvpFeatures,
  parseTechStack,
} from "@/lib/markdown-parser";
import { Skeleton } from "@/components/ui/skeleton";

interface GeneratedIdea {
  name: string;
  description: string;
}
type InterviewStep = "initial" | "questions" | "generating" | "result";

export default function GenerateIdeaDisplay() {
  const router = useRouter();
  const [step, setStep] = useState<InterviewStep>("initial");
  const [interest, setInterest] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [generatedIdea, setGeneratedIdea] = useState<GeneratedIdea | null>(
    null
  );
  const [isSaving, startSavingTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interest.trim()) return;
    setIsLoading(true);
    setStep("generating");
    setError(null);

    try {
      const response = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interest }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to get questions.");
      }
      const data = await response.json();
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(""));
      setCurrentQuestionIndex(0);
      setStep("questions");
    } catch (err: any) {
      toast.error("Error", { description: err.message });
      setStep("initial");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answers[currentQuestionIndex].trim()) {
      toast.error("Please provide an answer.");
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsLoading(true);
      setStep("generating");
      setError(null);
      try {
        const conversation = questions.reduce((acc: any, q, i) => {
          acc[q] = answers[i];
          return acc;
        }, {});

        const response = await fetch("/api/ai/generate-idea", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interest, conversation }),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to generate idea.");
        }
        const idea = await response.json();
        setGeneratedIdea(idea);
        setStep("result");
      } catch (err: any) {
        toast.error("Error", { description: err.message });
        setStep("questions");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // BAGIAN YANG DILENGKAPI #1: handleSaveIdea
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

  // RENDER LOGIC
  // BAGIAN YANG DILENGKAPI #2: Loading State
  if (step === "generating") {
    return (
      <div className="text-center max-w-2xl mx-auto mt-32">
        <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4 animate-pulse">
          <Lightbulb className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">AI is thinking...</h2>
        <p className="text-muted-foreground mt-2">
          Crafting the perfect idea based on your answers. Please wait a moment.
        </p>
        <div className="space-y-4 mt-8">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  // BAGIAN YANG DILENGKAPI #3: Result UI
  if (step === "result" && generatedIdea) {
    const mainGoal = getMainGoal(generatedIdea.description);
    const userFlow = getUserFlow(generatedIdea.description);
    const mvpFeatures = getMvpFeatures(generatedIdea.description);
    const techStack = parseTechStack(generatedIdea.description);
    console.log("Generated Idea:", generatedIdea.description);

    return (
      // Ganti bagian "result" di dalam GenerateIdeaDisplay.tsx dengan ini

      <div className="space-y-8 animate-in fade-in-50 mt-20 max-w-3xl mx-auto">
        {/* Header Utama */}
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {generatedIdea.name}
          </h1>
          <p className="mt-4 text-md text-muted-foreground max-w-2xl mx-auto">
            AI has generated a project blueprint for you. Review the details
            below and save it to your collection.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-bold mb-4">Main Application Goal</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown>{mainGoal}</ReactMarkdown>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">How It Works (User Flow)</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown>{userFlow}</ReactMarkdown>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">MVP Features</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown>{mvpFeatures}</ReactMarkdown>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Recommended Tech Stack</h2>
            <div className="space-y-6">
              {techStack.map((tech) => (
                <div key={tech.name}>
                  <h3 className="text-lg font-semibold">
                    {tech.name}:{" "}
                    <span className="font-normal text-muted-foreground">
                      {tech.tech}
                    </span>
                  </h3>
                  <p className="text-muted-foreground mt-1">{tech.reason}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Tombol Aksi */}
        <div className="mt-20 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleSaveIdea}
            disabled={isSaving}
            size="lg"
            className="w-full sm:w-auto py-6 text-base rounded-full"
          >
            <Plus className="w-5 h-5 mr-2" />
            Save to Collection
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep("initial")}
            disabled={isSaving}
            size="lg"
            className="w-full sm:w-auto py-6 text-base rounded-full"
          >
            <CornerUpLeft className="w-5 h-5 mr-2" />
            Generate Another
          </Button>
        </div>
      </div>
    );
  }

  if (step === "questions") {
    return (
      <Card className="max-w-2xl mx-auto mt-32 border-0 shadow-none animate-in fade-in-50">
        <CardHeader>
          <CardTitle>
            Just a few more questions... ({currentQuestionIndex + 1}/
            {questions.length})
          </CardTitle>
          <CardDescription>{questions[currentQuestionIndex]}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleQuestionSubmit} className="space-y-4">
            <Input
              value={answers[currentQuestionIndex]}
              onChange={(e) =>
                handleAnswerChange(currentQuestionIndex, e.target.value)
              }
              autoFocus
              placeholder="Your answer..."
              className="h-12 text-base"
            />
            <Button type="submit" className="rounded-full py-6 w-full">
              {currentQuestionIndex < questions.length - 1
                ? "Next Question"
                : "Generate Idea"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mt-32 mx-auto border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">
          Let AI be Your Creative Partner
        </CardTitle>
        <CardDescription className="text-md text-muted-foreground pt-2">
          Start by entering a field of interest. The AI will then ask you some
          follow-up questions to generate a tailored project idea.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInitialSubmit} className="w-full space-y-6 pt-4">
          <Input
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            placeholder="e.g., 'Educational app for children'"
            className="h-14 px-4 text-lg focus-visible:ring-2"
            disabled={isLoading}
            autoFocus
          />
          <Button
            type="submit"
            size="lg"
            className="w-full font-medium rounded-full py-6"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Interview
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
