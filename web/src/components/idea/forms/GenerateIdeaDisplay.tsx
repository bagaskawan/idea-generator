"use client";

import { useState, useTransition, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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

//IdeaCard
import { IdeaOption, IdeaOptionCard } from "@/components/idea/IdeaOptionCard";

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

type InterviewStep =
  | "initial"
  | "interviewing"
  | "showOptions"
  | "generating"
  | "result";

// Definisikan tipe untuk state yang akan disimpan di sessionStorage
interface InterviewSessionState {
  interest: string;
  conversationHistory: ConversationTurn[];
  currentQuestion: string;
  ideaOptions: IdeaOption[];
  generatedBlueprint: GeneratedBlueprint | null;
}

const sessionStorageKey = "interviewSessionState";

// Komponen utama yang akan kita bungkus dengan Suspense
function GenerateIdeaDisplayContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State lokal hanya untuk input dan transisi UI
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSaving, startSavingTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  // State tunggal yang dipulihkan dari sessionStorage
  const [sessionState, setSessionState] = useState<InterviewSessionState>({
    interest: "",
    conversationHistory: [],
    currentQuestion: "",
    ideaOptions: [],
    generatedBlueprint: null,
  });

  // Membaca `step` dari URL
  const currentStep = (searchParams.get("step") || "initial") as InterviewStep;

  // Inisialisasi editor Blocknote untuk mode read-only di halaman hasil
  const editor = useBlocknoteEditor();
  const theme = useBlocknoteTheme();

  // --- LOGIKA PEMULIHAN & PEMBARUAN STATE ---

  // Efek untuk memulihkan state dari sessionStorage saat komponen dimuat
  useEffect(() => {
    try {
      const savedStateJSON = sessionStorage.getItem(sessionStorageKey);
      if (savedStateJSON) {
        const savedState: InterviewSessionState = JSON.parse(savedStateJSON);
        setSessionState(savedState);
      }
    } catch (error) {
      console.error("Gagal mem-parsing state dari session:", error);
      sessionStorage.removeItem(sessionStorageKey);
    }
  }, []);

  // Efek untuk memuat konten ke editor Blocknote saat state siap
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

  // Fungsi helper untuk memperbarui URL dan sessionStorage
  const updateState = (
    step: InterviewStep,
    newState: Partial<InterviewSessionState>
  ) => {
    const updatedState = { ...sessionState, ...newState };
    setSessionState(updatedState);
    sessionStorage.setItem(sessionStorageKey, JSON.stringify(updatedState));

    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("step", step);
    // Gunakan router.push untuk navigasi sisi klien
    router.push(`${pathname}?${newParams.toString()}`);
  };

  // Fungsi untuk membersihkan state dan kembali ke awal
  const clearInterviewState = () => {
    sessionStorage.removeItem(sessionStorageKey);
    // Reset state lokal juga
    setSessionState({
      interest: "",
      conversationHistory: [],
      currentQuestion: "",
      ideaOptions: [],
      generatedBlueprint: null,
    });
    setCurrentAnswer("");
    router.push(pathname); // Kembali ke URL dasar
  };

  // --- HANDLER FUNGSI ---

  const handleStartInterview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Ambil nilai langsung dari elemen form untuk memastikan data terbaru
    const interestInput = e.currentTarget.elements.namedItem(
      "interest"
    ) as HTMLInputElement;
    const interestValue = interestInput.value;

    if (!interestValue.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/start-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interest: interestValue }),
      });

      if (!response.ok) throw new Error("Gagal memulai interview.");

      const data = await response.json();
      updateState("interviewing", {
        interest: interestValue,
        currentQuestion: data.question,
        // Reset state sebelumnya jika memulai dari awal
        conversationHistory: [],
        ideaOptions: [],
        generatedBlueprint: null,
      });
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnswer.trim()) {
      toast.error("Mohon berikan jawaban.");
      return;
    }

    setIsLoading(true);
    const newHistory: ConversationTurn[] = [
      ...sessionState.conversationHistory,
      { question: sessionState.currentQuestion, answer: currentAnswer },
    ];
    setCurrentAnswer(""); // Reset input setelah dikirim

    if (newHistory.length >= 3) {
      try {
        const res = await fetch("/api/ai/generate-idea-options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interest: sessionState.interest,
            conversation: newHistory,
          }),
        });
        if (!res.ok) throw new Error("Gagal mendapatkan opsi ide.");

        const data = await res.json();
        updateState("showOptions", {
          conversationHistory: newHistory,
          ideaOptions: data.ideas,
        });
      } catch (err: any) {
        toast.error("Error mendapatkan ide", { description: err.message });
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const res = await fetch("/api/ai/continue-interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interest: sessionState.interest,
            history: newHistory,
          }),
        });
        if (!res.ok)
          throw new Error("Gagal mendapatkan pertanyaan berikutnya.");

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
    updateState("generating", {}); // Pindah ke step generating dulu
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/generate-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interest: selectedIdea.projectName,
          conversation: [
            {
              question: "Final Idea",
              answer: selectedIdea.uniqueSellingProposition,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error("Gagal membuat blueprint.");

      const blueprint = await res.json();
      updateState("result", { generatedBlueprint: blueprint });
    } catch (err: any) {
      toast.error("Error membuat blueprint", { description: err.message });
      updateState("showOptions", {}); // Kembali jika gagal
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIdea = () => {
    if (!sessionState.generatedBlueprint) return;

    startSavingTransition(async () => {
      const result = await addIdea(sessionState.generatedBlueprint!);
      if (result.success && result.projectId) {
        toast.success("Blueprint berhasil disimpan!");
        clearInterviewState(); // Bersihkan state setelah berhasil
        router.push(`/idea/${result.projectId}`);
      } else {
        toast.error("Gagal menyimpan blueprint", {
          description: result.error,
        });
      }
    });
  };

  // --- RENDER LOGIC (UI) ---

  if (currentStep === "showOptions") {
    if (isLoading) {
      return (
        <div className="text-center max-w-2xl mx-auto mt-32">
          <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4 animate-pulse">
            <Lightbulb className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Mencari ide kreatif...</h2>
          <p className="text-muted-foreground mt-2">
            Menganalisis hasil wawancara untuk ide yang dipersonalisasi.
          </p>
        </div>
      );
    }
    return (
      <div className="container mx-auto p-8 animate-in fade-in-50 mt-28">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Berikut Beberapa Ide Untukmu</h1>
          <p className="text-muted-foreground mt-2">
            Berdasarkan jawabanmu, pilih salah satu untuk membuat blueprint
            lengkap.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {sessionState.ideaOptions.map((idea, index) => (
            <IdeaOptionCard
              key={index}
              idea={idea}
              onSelect={() => handleSelectIdea(idea)}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
    );
  }

  if (currentStep === "generating") {
    return (
      <div className="text-center max-w-2xl mx-auto mt-32">
        <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4 animate-pulse">
          <Lightbulb className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">AI sedang merancang...</h2>
        <p className="text-muted-foreground mt-2">
          Membuat blueprint lengkap berdasarkan jawabanmu. Mohon tunggu.
        </p>
        <div className="space-y-4 mt-8">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (currentStep === "result" && sessionState.generatedBlueprint) {
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
            Blueprint proyekmu sudah siap. Tinjau detail di bawah ini dan simpan
            ke koleksimu.
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

        {/* Menggunakan Blocknote untuk merender Workbench Content */}
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
            <Plus className="w-5 h-5 mr-2" /> Simpan ke Koleksi
          </Button>
          <Button
            variant="outline"
            onClick={clearInterviewState}
            disabled={isSaving}
            size="lg"
            className="w-full sm:w-auto py-6 text-base rounded-full"
          >
            <CornerUpLeft className="w-5 h-5 mr-2" /> Buat Ide Lain
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === "interviewing") {
    return (
      <Card className="max-w-2xl mx-auto mt-32 border-0 shadow-none animate-in fade-in-50">
        <CardHeader>
          <CardTitle>
            Wawancara AI ({sessionState.conversationHistory.length + 1}/3)
          </CardTitle>
          <CardDescription className="pt-2 text-base">
            {isLoading
              ? "Memikirkan pertanyaan berikutnya..."
              : sessionState.currentQuestion}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleContinueInterview} className="space-y-4">
            <Textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              autoFocus
              placeholder="Jawabanmu..."
              className="min-h-[120px] text-base resize-none"
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="rounded-full py-6 w-full"
              disabled={isLoading}
            >
              {isLoading
                ? "Memproses..."
                : sessionState.conversationHistory.length >= 2
                ? "Buat Blueprint"
                : "Pertanyaan Berikutnya"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Initial Step (Default)
  return (
    <Card className="max-w-2xl mt-32 mx-auto border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">
          Jadikan AI Partner Kreatifmu
        </CardTitle>
        <CardDescription className="text-md text-muted-foreground pt-2">
          Mulai dengan memasukkan bidang minat. AI akan melakukan wawancara
          singkat untuk membuat blueprint proyek yang disesuaikan untukmu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleStartInterview} className="w-full space-y-6 pt-4">
          <Input
            name="interest" // Beri nama agar bisa diakses dari form
            defaultValue={sessionState.interest} // Gunakan defaultValue untuk pulihkan state
            placeholder="contoh: 'Aplikasi edukasi untuk anak'"
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
            Mulai Wawancara
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Komponen Wrapper untuk menyediakan Suspense
export default function GenerateIdeaDisplay() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GenerateIdeaDisplayContent />
    </Suspense>
  );
}
