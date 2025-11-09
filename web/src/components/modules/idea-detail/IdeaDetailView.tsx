"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ScrollArea } from "@/components/shared/ui/scroll-area";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/shared/ui/skeleton";
import { Button } from "@/components/shared/ui/button";
import { toast } from "sonner";
import { Block } from "@blocknote/core";

// Custom hooks
import { useIdea } from "@/hooks/api/useIdeaDetail";
import { useRealtimeUpdates } from "@/hooks/features/useRealtimeUpdates";
import { useAutoSave } from "@/hooks/features/useAutoSave";
import { useBlocknoteEditor } from "@/hooks/util/useBlocknoteEditor";
import { HeadingItem } from "@/types";

// Components
import IdeaDetailHeader from "@/components/modules/idea-detail/IdeaDetailHeader";
import IdeaEditor from "@/components/modules/idea-detail/IdeaEditor";
import ProjectInfoSidebar from "@/components/modules/idea-detail/ProjectInfoSidebar";
import { LoadingState } from "@/components/modules/idea-generate/LoadingState";
import { TableOfContents } from "@/components/modules/idea-detail/TableofContents/TableOfContents";

// BlockNote Styles
import "@blocknote/mantine/style.css";
import "@blocknote/react/style.css";
import "@blocknote/xl-ai/style.css";

import { deleteIdea } from "@/lib/actions/idea-actions";
import { FloatingTableOfContents } from "@/components/modules/idea-detail/TableofContents/FloatingTableOfContents";

type IdeaDetailViewProps = {
  id: string;
};

function getBlockText(block: Block): string {
  return block.content
    .map((inline) => (inline.type === "text" ? inline.text : ""))
    .join("");
}

export default function IdeaDetailView({ id }: IdeaDetailViewProps) {
  const router = useRouter();
  const { idea, loading, error, refreshIdea } = useIdea(id);
  const editor = useBlocknoteEditor();
  const isRealtimeUpdate = useRef(false);
  const { isSaving } = useAutoSave(editor, id, isRealtimeUpdate);

  const [isGeneratingSchema, setIsGeneratingSchema] = useState(false);
  const [hasSchema, setHasSchema] = useState(false);

  //deleting ideas
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isManualSelect, setIsManualSelect] = useState(false);
  const isManualSelectRef = useRef<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useRealtimeUpdates(id, editor, isRealtimeUpdate);

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

  useEffect(() => {
    if (!editor) return;

    const updateHeadings = () => {
      const newHeadings: HeadingItem[] = [];
      for (const block of editor.topLevelBlocks) {
        if (block.type === "heading") {
          newHeadings.push({
            id: block.id,
            text: getBlockText(block),
            level: block.props.level,
          });
        }
      }
      setHeadings(newHeadings);
    };

    updateHeadings();

    const unsubscribe = editor.onEditorContentChange(updateHeadings);

    return () => {
      // Pengecekan defensif: hanya panggil jika unsubscribe adalah fungsi
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [editor, idea]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (!editor) return;

    const handleScroll = () => {
      if (isManualSelectRef.current) return;
      if (isManualSelect) return;
      const container = scrollContainerRef.current;
      if (!container) return;

      const progress =
        container.scrollTop / (container.scrollHeight - container.clientHeight);

      const nearTop = progress < 0.25;
      const nearBottom = progress > 0.95;

      if (nearBottom) {
        setActiveId(headings[headings.length - 1]?.id || null);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      let currentActiveId: string | null = null;
      let smallestDistance = Infinity;

      const reference = nearTop
        ? containerRect.top
        : containerRect.top + containerRect.height / 2;

      for (const heading of headings) {
        const el = container.querySelector(
          `[data-id="${heading.id}"]`
        ) as HTMLElement;
        if (!el) continue;

        const elRect = el.getBoundingClientRect();
        const distance = Math.abs(elRect.top - reference);

        if (distance < smallestDistance) {
          smallestDistance = distance;
          currentActiveId = heading.id;
        }
      }

      setActiveId(currentActiveId);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, [headings]);

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

  const handleHeadingClick = (blockId: string) => {
    const container = scrollContainerRef.current;
    if (!container || !editor) return;

    // stop scroll spy sementara
    isManualSelectRef.current = true;
    setIsManualSelect(true);
    setActiveId(blockId);

    // scroll dulu ke block
    const blockElement = container.querySelector(
      `[data-id="${blockId}"]`
    ) as HTMLElement | null;

    if (blockElement) {
      blockElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    queueMicrotask(() => {
      try {
        if (typeof editor.setSelectedBlocks === "function") {
          editor.setSelectedBlocks([blockId]);
        }
      } catch (e) {
        console.error("setSelectedBlocks error:", e);
      }
    });

    // balikin scroll spy setelah delay
    setTimeout(() => {
      isManualSelectRef.current = false;
      setIsManualSelect(false);
    }, 700);
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

        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8 mt-8 ">
          <aside className="hidden lg:block lg:col-span-1 mt-8 lg:mt-0">
            <div className="sticky top-24 z-10">
              <FloatingTableOfContents
                headings={headings}
                onHeadingClick={handleHeadingClick}
                activeId={activeId}
              />
            </div>
          </aside>
          <div
            ref={scrollContainerRef}
            className="lg:col-span-7 h-[calc(100vh-150px)] overflow-y-auto pr-4"
          >
            {editor && <IdeaEditor editor={editor} />}
          </div>

          <div className="lg:col-span-4 mt-8 lg:mt-0">
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
