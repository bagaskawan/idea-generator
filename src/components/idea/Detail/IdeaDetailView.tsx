"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

// Custom hooks
import { useIdea } from "@/hooks/detail-idea/useIdeaDetail";
import { useRealtimeUpdates } from "@/hooks/detail-idea/useRealtimeUpdates";
import { useAutoSave } from "@/hooks/detail-idea/useAutoSave";

// Components
import IdeaDetailHeader from "@/components/idea/detail/IdeaDetailHeader";
import IdeaEditor from "@/components/idea/detail/IdeaEditor";

// BlockNote
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";

type IdeaDetailViewProps = {
  id: string;
};

export default function IdeaDetailView({ id }: IdeaDetailViewProps) {
  const router = useRouter();
  const { idea, loading, error } = useIdea(id);
  const editor = useCreateBlockNote();
  const isRealtimeUpdate = useRef(false);

  const { isSaving } = useAutoSave(editor, id, isRealtimeUpdate);
  useRealtimeUpdates(id, editor, isRealtimeUpdate);

  // Sync editor with idea description
  useEffect(() => {
    const syncEditor = async () => {
      if (!editor || !idea) return;

      try {
        const blocks = editor.topLevelBlocks;
        const isEditorEmpty =
          blocks.length === 1 &&
          blocks[0].type === "paragraph" &&
          (blocks[0].content === undefined || (Array.isArray(blocks[0].content) && blocks[0].content.length === 0));

        if (isEditorEmpty && (idea.name || idea.description)) {
          const fullContent = `# ${idea.name || ''}\n\n${idea.description || ''}`;
          const newBlocks = await editor.tryParseMarkdownToBlocks(
            fullContent
          );
          editor.replaceBlocks(editor.topLevelBlocks, newBlocks);
        }
      } catch (error) {
        console.error("Error syncing editor:", error);
      }
    };

    if (idea && editor) {
      syncEditor();
    }
  }, [editor, idea]);

  if (error) {
    return <div className="text-red-500 text-center mt-20">{error}</div>;
  }

  if (!idea && !loading) {
    return <div className="text-center mt-20">Proyek tidak ditemukan.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <IdeaDetailHeader onBack={() => router.back()} isSaving={isSaving} />

      <div className="w-full">
        <div className="space-y-8">
          {loading ? (
            <div className="pt-4">
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <IdeaEditor editor={editor} />
          )}
        </div>
      </div>
    </div>
  );
}