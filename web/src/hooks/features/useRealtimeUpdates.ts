import { useEffect } from "react";
import { createClient } from "@/lib/db/client";
import { toast } from "sonner";

export const useRealtimeUpdates = (
  id: string,
  editor: any,
  isRealtimeUpdate: React.MutableRefObject<boolean>
) => {
  const supabase = createClient();

  useEffect(() => {
    if (!id || !supabase || !editor) return;

    const channel = supabase
      .channel(`project-description-update-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "projects",
          filter: `id=eq.${id}`,
        },
        async (payload) => {
          const newDescription = payload.new.description as string;
          const currentMarkdown = await editor.blocksToMarkdownLossy(
            editor.topLevelBlocks
          );

          if (newDescription && newDescription !== currentMarkdown) {
            toast.info("Deskripsi diperbarui oleh pengguna lain.");

            isRealtimeUpdate.current = true;
            const blocks = await editor.tryParseMarkdownToBlocks(
              newDescription
            );
            editor.replaceBlocks(editor.topLevelBlocks, blocks);

            setTimeout(() => {
              isRealtimeUpdate.current = false;
            }, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, supabase, editor, isRealtimeUpdate]);
};
