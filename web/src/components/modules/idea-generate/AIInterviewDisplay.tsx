"use client";

import { useState, useTransition, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { ExpandingTextarea } from "@/components/shared/ui/expandingtextarea";
import { Badge } from "@/components/shared/ui/badge";
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
  Search,
  Zap,
} from "lucide-react";
import { addIdea } from "@/lib/actions/idea-actions";
import { toast } from "sonner";
import { Skeleton } from "@/components/shared/ui/skeleton";
import { IconMapper } from "@/components/modules/idea-detail/IconMapper";

// Import for read-only Blocknote
import { BlockNoteView } from "@blocknote/mantine";
import { useBlocknoteEditor } from "@/hooks/util/useBlocknoteEditor";
import { useBlocknoteTheme } from "@/hooks/util/useBlockNoteTheme";
import "@blocknote/mantine/style.css";
import "@blocknote/react/style.css";
import "@blocknote/xl-ai/style.css";

// Loading animation
import { LoadingState } from "@/components/modules/idea-generate/LoadingState";
import { GeneratingAnimation } from "@/components/shared/ui/generatinganimation";

// IdeaCard
import {
  IdeaOption,
  AIIdeaOptionCard,
} from "@/components/modules/idea-generate/AIIdeaOptionCard";

// Tipe data
interface ConversationTurn {
  question: string;
  answer: string;
}
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
type InterviewStep =
  | "initial"
  | "interviewing"
  | "showOptions"
  | "generating"
  | "result";
interface InterviewSessionState {
  interest: string;
  conversationHistory: ConversationTurn[];
  currentQuestion: string;
  ideaOptions: IdeaOption[];
  generatedBlueprint: GeneratedBlueprint | null;
}

const sessionStorageKey = "interviewSessionState";

// Komponen utama
function AIInterviewDisplayContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSaving, startSavingTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sessionState, setSessionState] = useState<InterviewSessionState>({
    interest: "",
    conversationHistory: [],
    currentQuestion: "",
    ideaOptions: [],
    generatedBlueprint: null,
  });

  const currentStep = (searchParams.get("step") || "initial") as InterviewStep;
  const editor = useBlocknoteEditor();
  const theme = useBlocknoteTheme();

  useEffect(() => {
    try {
      const savedStateJSON = sessionStorage.getItem(sessionStorageKey);
      if (savedStateJSON) {
        const savedState: InterviewSessionState = JSON.parse(savedStateJSON);
        setSessionState(savedState);
      }
    } catch (error) {
      console.error("Failed to parse state from session:", error);
      sessionStorage.removeItem(sessionStorageKey);
    }
  }, []);

  useEffect(() => {
    if (currentStep === "result" && sessionState.generatedBlueprint && editor) {
      const loadContent = async () => {
        const blocks = await editor.tryParseMarkdownToBlocks(
          sessionState.generatedBlueprint!.workbenchContent
        );
        editor.replaceBlocks(editor.topLevelBlocks, blocks);
      };
      loadContent();
    }
  }, [currentStep, sessionState.generatedBlueprint, editor]);

  const updateState = (
    step: InterviewStep,
    newState: Partial<InterviewSessionState>
  ) => {
    const updatedState = { ...sessionState, ...newState };
    setSessionState(updatedState);
    sessionStorage.setItem(sessionStorageKey, JSON.stringify(updatedState));
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("step", step);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const clearInterviewState = () => {
    sessionStorage.removeItem(sessionStorageKey);
    setSessionState({
      interest: "",
      conversationHistory: [],
      currentQuestion: "",
      ideaOptions: [],
      generatedBlueprint: null,
    });
    setCurrentAnswer("");
    router.push(pathname);
  };

  const handleStartInterview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const interestInput = e.currentTarget.elements.namedItem(
      "interest"
    ) as HTMLInputElement;
    const interestValue = interestInput.value;
    if (!interestValue.trim()) return;

    setIsTransitioning(true);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/start-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interest: interestValue }),
      });
      if (!response.ok) throw new Error("Failed to start the interview.");
      const data = await response.json();
      updateState("interviewing", {
        interest: interestValue,
        currentQuestion: data.question,
        conversationHistory: [],
        ideaOptions: [],
        generatedBlueprint: null,
      });
    } catch (err: any) {
      toast.error("Error", { description: err.message });
      setIsTransitioning(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnswer.trim()) {
      toast.error("Please provide an answer.");
      return;
    }

    const newHistory: ConversationTurn[] = [
      ...sessionState.conversationHistory,
      { question: sessionState.currentQuestion, answer: currentAnswer },
    ];
    setCurrentAnswer("");

    if (newHistory.length >= 3) {
      setIsTransitioning(true);
      setIsLoading(true);
      try {
        const res = await fetch("/api/ai/generate-idea-options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interest: sessionState.interest,
            conversation: newHistory,
          }),
        });
        if (!res.ok) throw new Error("Failed to get idea options.");
        const data = await res.json();
        updateState("showOptions", {
          conversationHistory: newHistory,
          ideaOptions: data.ideas,
        });
      } catch (err: any) {
        toast.error("Error getting ideas", { description: err.message });
        setIsTransitioning(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        const res = await fetch("/api/ai/continue-interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interest: sessionState.interest,
            history: newHistory,
          }),
        });
        if (!res.ok) throw new Error("Failed to get the next question.");
        const data = await res.json();
        updateState("interviewing", {
          conversationHistory: newHistory,
          currentQuestion: data.question,
        });
      } catch (err: any) {
        toast.error("Error", { description: err.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectIdea = async (selectedIdea: IdeaOption) => {
    updateState("generating", {});
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/generate-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interest: sessionState.interest,
          projectName: selectedIdea.projectName,
          projectDescription: selectedIdea.projectDescription,
          mvpFeatures: selectedIdea.mvpFeatures,
          uniqueSellingProposition: selectedIdea.uniqueSellingProposition,
          conversation: [
            {
              question: "Final Idea",
              answer: selectedIdea.uniqueSellingProposition,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error("Failed to generate the blueprint.");
      const blueprint = await res.json();
      updateState("result", { generatedBlueprint: blueprint });
    } catch (err: any) {
      toast.error("Error generating blueprint", { description: err.message });
      updateState("showOptions", {});
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIdea = () => {
    if (!sessionState.generatedBlueprint) return;
    startSavingTransition(async () => {
      const result = await addIdea(sessionState.generatedBlueprint!);
      if (result.success && result.projectId) {
        toast.success("Blueprint saved successfully!");
        clearInterviewState();
        router.push(`/idea/${result.projectId}`);
      } else {
        toast.error("Failed to save blueprint", {
          description: result.error,
        });
      }
    });
  };

  // --- LOGIKA RENDER ANTI-FLICKER ---

  if (isTransitioning) {
    if (currentStep === "initial") {
      return (
        <LoadingState
          title="Preparing Your Interview..."
          texts={[
            "Analyzing your interest...",
            "Contacting our AI Architect...",
            "Crafting the perfect first question...",
          ]}
        />
      );
    }
    if (currentStep === "interviewing") {
      return (
        <LoadingState
          title="Finding Creative Ideas..."
          texts={[
            "Analyzing your answers...",
            "Searching for inspiration...",
            "Crafting unique concepts...",
          ]}
        />
      );
    }
  }

  // Tampilan utama berdasarkan step
  switch (currentStep) {
    case "interviewing":
      const step = sessionState.conversationHistory.length + 1;
      const totalSteps = 3;
      const isLastStep = step >= totalSteps;
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4 animate-in fade-in-50 text-center pb-24">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
              <GeneratingAnimation
                texts={[
                  "Analyzing your answer...",
                  "Formulating the next question...",
                ]}
                className="text-3xl font-semibold text-muted-foreground tracking-tight"
              />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 border border-gray-100 animate-in fade-in-50">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight"></h2>
                <span className="text-sm font-medium text-gray-500">
                  {step}/{totalSteps}
                </span>
              </div>
              <form onSubmit={handleContinueInterview} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 max-w-6xl p-8">
                  <div>
                    <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-10">
                      {sessionState.currentQuestion}
                    </h2>
                    <ExpandingTextarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      autoFocus
                      placeholder="Your answer..."
                      disabled={isLoading}
                    />
                  </div>
                  <div className="mt-8 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isLoading || !currentAnswer.trim()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLastStep ? "Generate Ideas" : "Next Step"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      );

    case "showOptions":
      if (isTransitioning) setIsTransitioning(false);
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4 animate-in fade-in-50 text-center pb-24">
          <div className="container mx-auto px-4 py-24 sm:py-32">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground">
                Here Are a Few Directions
              </h1>
              <p className="text-lg text-muted-foreground mt-4">
                Based on our conversation, here are three tailored project
                concepts. Select one to instantly generate a complete project
                blueprint.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto text-left">
              {sessionState.ideaOptions.map((idea, index) => (
                <AIIdeaOptionCard
                  key={index}
                  idea={idea}
                  onSelect={() => handleSelectIdea(idea)}
                  isLoading={isLoading}
                />
              ))}
            </div>
          </div>
        </div>
      );

    case "generating":
      return (
        <LoadingState
          title="AI is Architecting..."
          texts={[
            "Building the blueprint...",
            "Structuring the roadmap...",
            "Defining the tech stack...",
            "Finalizing the details...",
          ]}
        />
      );

    case "result":
      if (sessionState.generatedBlueprint) {
        const { projectData } = sessionState.generatedBlueprint;
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
                Your project blueprint is ready. Review the details below and
                save it to your collection.
              </p>
            </div>
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
                      <span className="text-muted-foreground">
                        {audience.text}
                      </span>
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
                        Quantitative
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
                        Qualitative
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
            <div className="rounded-lg bg-card/50 p-2">
              {editor && (
                <BlockNoteView editor={editor} editable={false} theme={theme} />
              )}
            </div>
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
                onClick={clearInterviewState}
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
      return null;

    case "initial":
    default:
      if (isTransitioning) setIsTransitioning(false);
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4 animate-in fade-in-50 text-center pb-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-12">
              Architect Your Next <br /> Big Idea{" "}
              <Lightbulb className="inline-block w-10 h-10 text-primary -mt-2" />
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Start with a keyword, and let our AI guide you through the
              creation process.
            </p>
            <form
              onSubmit={handleStartInterview}
              className="relative w-full mx-auto"
            >
              <Input
                name="interest"
                defaultValue={sessionState.interest}
                placeholder="Make a Travel App"
                className="h-14 px-6 text-lg rounded-full border-2 border-input focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-primary/50"
                disabled={isLoading}
                autoFocus
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
                aria-label="Start Interview"
              >
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </Button>
            </form>
          </div>
        </div>
      );
  }
}

// Wrapper component
export default function AIInterviewDisplay() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AIInterviewDisplayContent />
    </Suspense>
  );
}
