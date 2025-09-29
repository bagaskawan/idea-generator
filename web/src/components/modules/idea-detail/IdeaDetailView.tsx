"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ScrollArea } from "@/components/shared/ui/scroll-area";
import { useRouter } from "next/navigation";
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
import { Trash2 } from "lucide-react";

// Custom hooks
import { useIdea } from "@/hooks/api/useIdeaDetail";
import { useRealtimeUpdates } from "@/hooks/features/useRealtimeUpdates";
import { useAutoSave } from "@/hooks/features/useAutoSave";
import { useBlocknoteEditor } from "@/hooks/util/useBlocknoteEditor";

// Components
import IdeaDetailHeader from "@/components/modules/idea-detail/IdeaDetailHeader";
import IdeaEditor from "@/components/modules/idea-detail/IdeaEditor";
import ProjectInfoSidebar from "@/components/modules/idea-detail/ProjectInfoSidebar";

// BlockNote Styles
import "@blocknote/mantine/style.css";
import "@blocknote/react/style.css";
import "@blocknote/xl-ai/style.css";

// Definisikan tipe untuk skema database
interface Table {
  table_name: string;
  columns: any[];
}

import { deleteIdea } from "@/lib/actions/idea-actions";
import { jsonToMarkdown } from "@/lib/blueprint-parser";
import { GenerateSchemaButton } from "@/components/modules/idea-detail/GenerateSchemaButton";
import { DatabaseSchemaDisplay } from "@/components/modules/idea-detail/DatabaseSchema/DatabaseSchemaDisplay";

type IdeaDetailViewProps = {
  id: string;
};

export default function IdeaDetailView({ id }: IdeaDetailViewProps) {
  const router = useRouter();
  const { idea, loading, error, refreshIdea } = useIdea(id);
  const editor = useBlocknoteEditor();
  const isRealtimeUpdate = useRef(false);
  const { isSaving } = useAutoSave(editor, id, isRealtimeUpdate);

  // Generate Schema
  const [databaseSchema, setDatabaseSchema] = useState<Table[] | null>(null);
  const [isGeneratingSchema, setIsGeneratingSchema] = useState(false);

  //deleting ideas
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useRealtimeUpdates(id, editor, isRealtimeUpdate);

  useEffect(() => {
    // Reset input konfirmasi setiap kali dialog ditutup
    if (!isDeleteDialogOpen) {
      setDeleteConfirmationInput("");
      setDeleteError(null);
    }
  }, [isDeleteDialogOpen]);

  // useEffect sekarang akan mengisi editor dari workbenchContent.markdown
  useEffect(() => {
    const syncEditorContent = async () => {
      if (editor && idea?.workbenchContent?.markdown) {
        // Cek jika editor benar-benar kosong untuk menghindari penimpaan yang tidak perlu
        const blocks = editor.topLevelBlocks;
        const isEditorEmpty =
          blocks.length === 0 ||
          (blocks.length === 1 && !blocks[0].content?.toString.length);

        if (isEditorEmpty && (idea.title || idea.workbenchContent)) {
          // Gabungkan title sebagai H1 dengan sisa konten dari workbench
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
    setDatabaseSchema(null);
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

      const data = await res.json();
      setDatabaseSchema(data.schema);
      toast.success("Database schema generated successfully!");
    } catch (error: any) {
      toast.error("Error", { description: error.message });
    } finally {
      setIsGeneratingSchema(false);
    }
  };

  const handleDeleteConfirm = (event: React.MouseEvent) => {
    event.preventDefault(); // Mencegah dialog tertutup secara otomatis
    if (!idea) return;
    console.log("Idea: ", deleteConfirmationInput);
    console.log("Idea Title: ", idea.title);

    if (deleteConfirmationInput !== idea.title) {
      setDeleteError(`Please type ${idea.title} to confirm.`);
      return; // Hentikan fungsi jika tidak cocok
    }

    startDeleteTransition(async () => {
      const result = await deleteIdea(id);
      if (result?.error) {
        toast.error("Failed to delete idea", {
          description: result.error,
        });
      } else {
        toast.success("Idea successfully deleted");
        router.push("/dashboard"); // Redirect setelah berhasil hapus
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

  const isDeleteButtonDisabled = isDeleting;

  return (
    <>
      <div className="max-w-screen-2xl h-full mx-auto px-4 sm:px-6 lg:px-6">
        <IdeaDetailHeader isSaving={isSaving} />

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12 mt-8">
          {/* Kolom Kiri: Workbench (Editor) dengan ScrollArea */}
          <div className="lg:col-span-2">
            <ScrollArea className="h-[calc(100vh-200px)] pr-4">
              {editor && <IdeaEditor editor={editor} />}

              {/* --- LOKASI BARU UNTUK MENAMPILKAN HASIL SCHEMA --- */}
              {isGeneratingSchema && (
                <div className="text-center mt-12">
                  <p className="text-muted-foreground animate-pulse">
                    Analyzing blueprint and building relations...
                  </p>
                </div>
              )}
              {databaseSchema && (
                <div className="mt-12">
                  <DatabaseSchemaDisplay schema={databaseSchema} />
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Kolom Kanan: Project Info Sidebar */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <ScrollArea className="h-[calc(100vh-200px)] pr-4">
              <div className="mb-8">
                <ProjectInfoSidebar project={idea} onUpdate={refreshIdea} />
              </div>
            </ScrollArea>
            <div className="mt-auto p-2 border-t border-border/50 flex-shrink-0 text-center">
              <GenerateSchemaButton
                onClick={handleGenerateSchema}
                isLoading={isGeneratingSchema}
              />
              <Button
                variant="outline"
                className="w-full p-6 mt-8 border-red-500 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Idea
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Komponen Dialog Konfirmasi Hapus */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this entire project permanently?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              workspace, including all pages and files. Please type the name of
              the workspace to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-2 space-y-2">
            <Input
              value={deleteConfirmationInput}
              onChange={(e) => {
                setDeleteConfirmationInput(e.target.value);
                if (deleteError) setDeleteError(null);
              }}
              placeholder={`${idea.title}`}
              className="my-2"
              autoFocus
            />
            {deleteError && (
              <p className="text-sm text-red-600">{deleteError}</p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleteButtonDisabled}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Yes, delete this project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
