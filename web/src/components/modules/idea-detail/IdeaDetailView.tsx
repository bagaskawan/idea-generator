"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ScrollArea } from "@/components/shared/ui/scroll-area";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/shared/ui/skeleton";
import { Button } from "@/components/shared/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shared/ui/alert-dialog";
import { Input } from "@/components/shared/ui/input";
import { Database, Trash2, Workflow } from "lucide-react";

// Custom hooks
import { useIdea } from "@/hooks/api/useIdeaDetail";
import { useRealtimeUpdates } from "@/hooks/features/useRealtimeUpdates";
import { useAutoSave } from "@/hooks/features/useAutoSave";
import { useBlocknoteEditor } from "@/hooks/util/useBlocknoteEditor";

// Components
import IdeaDetailHeader from "@/components/modules/idea-detail/IdeaDetailHeader";
import IdeaEditor from "@/components/modules/idea-detail/IdeaEditor";
import ProjectInfoSidebar from "@/components/modules/idea-detail/ProjectInfoSidebar";
import { LoadingState } from "@/components/modules/idea-generate/LoadingState"; // Import LoadingState
import { GenerateSchemaButton } from "@/components/modules/idea-detail/GenerateSchemaButton";

// BlockNote Styles
import "@blocknote/mantine/style.css";
import "@blocknote/react/style.css";
import "@blocknote/xl-ai/style.css";

import { deleteIdea } from "@/lib/actions/idea-actions";

type IdeaDetailViewProps = {
  id: string;
};

export default function IdeaDetailView({ id }: IdeaDetailViewProps) {
  const router = useRouter();
  const { idea, loading, error, refreshIdea } = useIdea(id);
  const editor = useBlocknoteEditor();
  const isRealtimeUpdate = useRef(false);
  const { isSaving } = useAutoSave(editor, id, isRealtimeUpdate);

  // --- PERBAIKAN: State untuk mengelola proses generate schema ---
  const [isGeneratingSchema, setIsGeneratingSchema] = useState(false);
  const [hasSchema, setHasSchema] = useState(false);

  //deleting ideas
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useRealtimeUpdates(id, editor, isRealtimeUpdate);

  // --- PERBAIKAN: Cek apakah schema sudah ada saat data 'idea' dimuat ---
  useEffect(() => {
    if (idea?.hasSchema) {
      setHasSchema(true);
    }
  }, [idea]);

  useEffect(() => {
    if (!isDeleteDialogOpen) {
      setDeleteConfirmationInput("");
      setDeleteError(null);
    }
  }, [isDeleteDialogOpen]);

  useEffect(() => {
    const syncEditorContent = async () => {
      if (editor && idea?.workbenchContent?.markdown) {
        const blocks = editor.topLevelBlocks;
        const isEditorEmpty =
          blocks.length === 0 ||
          (blocks.length === 1 && !blocks[0].content?.toString.length);

        if (isEditorEmpty && (idea.title || idea.workbenchContent)) {
          const fullMarkdownContent = `# ${idea.title}\n\n${
            idea.workbenchContent?.markdown || ""
          }`;
          const newBlocks = await editor.tryParseMarkdownToBlocks(
            fullMarkdownContent
          );
          editor.replaceBlocks(editor.topLevelBlocks, newBlocks);
        }
      }
    };
    syncEditorContent();
  }, [editor, idea]);

  const handleGenerateSchema = async () => {
    if (!idea) return;

    setIsGeneratingSchema(true);
    toast.info("AI is designing your database schema...");

    try {
      const workbenchContent = idea.workbenchContent?.markdown || "";
      const problemStatement = idea.problem_statement || "";
      const userStoriesMatch = workbenchContent.match(
        /### User Stories\s*([\s\S]*?)(?=\n###|$)/
      );
      const apiEndpointsMatch = workbenchContent.match(
        /### API Endpoints\s*([\s\S]*?)(?=\n###|$)/
      );

      const res = await fetch("/api/ai/generate-database-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: idea.id,
          projectDescription: problemStatement,
          userStories: userStoriesMatch ? userStoriesMatch[1].trim() : "",
          apiEndpoints: apiEndpointsMatch ? apiEndpointsMatch[1].trim() : "",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate schema.");
      }

      await res.json();
      toast.success("Database schema generated successfully!");

      // --- PERBAIKAN: Redirect ke halaman schema setelah berhasil ---
      router.push(`/idea/${id}/schema`);
    } catch (error: any) {
      toast.error("Error", { description: error.message });
      setIsGeneratingSchema(false); // Pastikan loading berhenti jika ada error
    }
    // Tidak perlu 'finally' karena kita redirect on success
  };

  const handleDeleteConfirm = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!idea) return;

    if (deleteConfirmationInput !== idea.title) {
      setDeleteError(`Please type ${idea.title} to confirm.`);
      return;
    }

    startDeleteTransition(async () => {
      const result = await deleteIdea(id);
      if (result?.error) {
        toast.error("Failed to delete idea", {
          description: result.error,
        });
      } else {
        toast.success("Idea successfully deleted");
        router.push("/dashboard");
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-48 mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // --- PERBAIKAN: Tampilkan loading state terpusat ---
  if (isGeneratingSchema) {
    return (
      <LoadingState
        title="AI is Architecting Your Schema..."
        texts={[
          "Analyzing blueprint and building relations...",
          "Defining tables and columns...",
          "Finalizing the structure...",
        ]}
      />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen -mt-20">
        <div className="text-center text-2xl">{error}</div>
        <Button
          onClick={() => router.push("/dashboard")}
          variant="ghost"
          className="mt-8 text-md p-8"
        >
          Kembali ke Dasbor
        </Button>
      </div>
    );
  }

  if (!idea) {
    return <div className="text-center mt-20">Proyek tidak ditemukan.</div>;
  }

  return (
    <>
      <div className="max-w-screen-2xl h-full mx-auto px-4 sm:px-6 lg:px-6">
        <IdeaDetailHeader id={id} isSaving={isSaving} />

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12 mt-8">
          <div className="lg:col-span-2">
            <ScrollArea className="h-[calc(100vh-200px)] pr-4">
              {editor && <IdeaEditor editor={editor} />}
            </ScrollArea>
          </div>

          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <ScrollArea className="h-[calc(100vh-200px)] pr-4">
              <div className="mb-8">
                <ProjectInfoSidebar project={idea} onUpdate={refreshIdea} />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  );
}
