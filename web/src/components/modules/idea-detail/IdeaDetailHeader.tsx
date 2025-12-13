import { Button } from "@/components/shared/ui/button";
import { ArrowLeft, Ellipsis, Database, Trash2, File } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shared/ui/dropdown-menu";
import { useEffect, useState, useTransition } from "react";
import { useIdea } from "@/hooks/api/useIdeaDetail";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteIdea } from "@/lib/actions/idea-actions";
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
import { LoadingState } from "@/components/modules/idea-generate/LoadingState";
import { PdfPreviewDialog } from "@/components/modules/idea-detail/Export/PdfPreviewDialog";
import { api } from "@/lib/api-client";

interface IdeaDetailHeaderProps {
  id: string;
  isSaving?: boolean;
}

export default function IdeaDetailHeader({
  id,
  isSaving,
}: IdeaDetailHeaderProps) {
  const router = useRouter();
  const { idea, loading, error, refreshIdea } = useIdea(id);
  //deleting ideas
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // --- PERBAIKAN: State untuk mengelola proses generate schema ---
  const [isGeneratingSchema, setIsGeneratingSchema] = useState(false);
  const [hasSchema, setHasSchema] = useState(false);

  // PDF Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const handleGenerateSchema = async () => {
    if (!idea) return;

    setIsGeneratingSchema(true);
    toast.info("AI is designing your database schema...");

    try {
      const problemStatement = idea.problem_statement || "";
      const workbenchContent = idea.workbenchContent?.markdown || "";

      const fullContext = `
        Problem Statement:
        ${problemStatement}

        ---

        Project Details (from workbench):
        ${workbenchContent}
      `.trim();

      if (!fullContext.trim()) {
        toast.error("Project context is missing", {
          description:
            "Please add a problem statement or content to your project's workbench.",
        });
        setIsGeneratingSchema(false);
        return;
      }

      const res = await api.generateDatabaseSchema({
        projectId: idea.id,
        projectContext: fullContext,
      });

      // The api client already parses JSON and handles errors
      // await res.json(); // Not needed as api client returns parsed json

      // if (!res.ok) { ... } logic handled by api client

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

  return (
    <>
      <header className="relative flex items-center justify-between mb-12 h-10 px-4">
        {/* Left Side */}
        <Link href="/dashboard" passHref>
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke List Proyek</span>
          </Button>
        </Link>
        {/* Center */}
        {isSaving && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            Menyimpan...
          </span>
        )}
        {/* Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center">
              <Ellipsis className="w-4 h-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => {
                if (hasSchema) {
                  router.push(`/idea/${id}/schema`);
                } else {
                  handleGenerateSchema();
                }
              }}
            >
              <Database className="w-4 h-4 mr-2" />
              <span>
                {hasSchema
                  ? "View Database Schema"
                  : "Generate Database Schema"}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setIsPreviewOpen(true);
              }}
            >
              <File className="w-4 h-4 mr-2" />
              <span>Export to PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setIsDeleteDialogOpen(true)}
              variant="destructive"
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              <span>Delete Idea</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {idea && (
        <PdfPreviewDialog
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          idea={idea}
        />
      )}

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
              workspace. Please type the name of the workspace to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-2 space-y-2">
            <Input
              value={deleteConfirmationInput}
              onChange={(e) => {
                setDeleteConfirmationInput(e.target.value);
                if (deleteError) setDeleteError(null);
              }}
              placeholder={`${idea?.title}`}
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
              disabled={isDeleting}
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
