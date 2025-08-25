"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CardContent } from "@/components/ui/card";
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
        const currentMarkdown = await editor.blocksToMarkdownLossy(
          editor.topLevelBlocks
        );

        if (
          (!currentMarkdown || currentMarkdown.trim() === "") &&
          idea.description
        ) {
          const blocks = await editor.tryParseMarkdownToBlocks(
            idea.description
          );
          editor.replaceBlocks(editor.topLevelBlocks, blocks);
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
          <h2 className="text-5xl font-bold mb-16 text-center text-[#5a1a1a]">
            {loading ? (
              <Skeleton className="h-12 w-1/2 mx-auto" />
            ) : (
              <strong>{idea?.name}</strong>
            )}
          </h2>

          <CardContent>
            {loading ? (
              <div className="pt-4">
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <IdeaEditor editor={editor} />
            )}
          </CardContent>
        </div>
      </div>
    </div>
  );
}
