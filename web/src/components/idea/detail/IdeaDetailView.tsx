"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Custom hooks
import { useIdea } from "@/hooks/detail-idea/useIdeaDetail";
import { useRealtimeUpdates } from "@/hooks/detail-idea/useRealtimeUpdates";
import { useAutoSave } from "@/hooks/detail-idea/useAutoSave";
import { useBlocknoteEditor } from "@/hooks/detail-idea/useBlocknoteEditor";

// Components
import IdeaDetailHeader from "@/components/idea/detail/IdeaDetailHeader";
import IdeaEditor from "@/components/idea/detail/IdeaEditor";
import ProjectInfoSidebar from "@/components/idea/detail/ProjectInfoSidebar";

// BlockNote Styles
import "@blocknote/mantine/style.css";
import "@blocknote/react/style.css";
import "@blocknote/xl-ai/style.css";

type IdeaDetailViewProps = {
  id: string;
};

export default function IdeaDetailView({ id }: IdeaDetailViewProps) {
  const router = useRouter();
  const { idea, loading, error, refreshIdea } = useIdea(id);
  const editor = useBlocknoteEditor();
  const isRealtimeUpdate = useRef(false);
  const { isSaving } = useAutoSave(editor, id, isRealtimeUpdate);

  useRealtimeUpdates(id, editor, isRealtimeUpdate);

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

  return (
    <div className="max-w-screen-2xl h-full mx-auto px-4 sm:px-6 lg:px-6">
      <IdeaDetailHeader onBack={() => router.back()} isSaving={isSaving} />

      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12 mt-8">
        {/* Kolom Kiri: Workbench (Editor) dengan ScrollArea */}
        <div className="lg:col-span-2">
          <ScrollArea className="h-[calc(100vh-200px)] pr-4">
            {editor && <IdeaEditor editor={editor} />}
          </ScrollArea>
        </div>

        {/* Kolom Kanan: Project Info Sidebar */}
        <div className="lg:col-span-1 mt-8 lg:mt-0">
          <ScrollArea className="h-[calc(100vh-200px)] pr-2">
            <ProjectInfoSidebar project={idea} onUpdate={refreshIdea} />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
