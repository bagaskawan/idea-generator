import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { type BlockNoteEditor, type Block } from "@blocknote-core";
import { getBlockText } from "@/lib/blocknoteHeaderUtils"; // <-- Import helper yang sudah ada

export const useAutoSave = (
  editor: BlockNoteEditor | null,
  id: string,
  isRealtimeUpdate: React.MutableRefObject<boolean>
) => {
  const supabase = createClient();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isInitialized = useRef(false);

  const saveChanges = useCallback(async () => {
    if (!editor || !id) {
      console.error("Editor or ID is not available for saving");
      return;
    }

    setIsSaving(true);
    try {
      const blocks: Block[] = editor.topLevelBlocks;
      let newTitle = "Untitled Project";
      let workbenchMarkdown = "";

      // PERBAIKAN 1: Logika yang lebih aman untuk mengekstrak judul dan konten
      if (blocks.length > 0) {
        const titleBlock = blocks[0];
        // Menggunakan helper getBlockText yang aman, bukan .map()
        newTitle = getBlockText(titleBlock) || "Untitled Project";

        if (blocks.length > 1) {
          const contentBlocks = blocks.slice(1);
          workbenchMarkdown = await editor.blocksToMarkdownLossy(contentBlocks);
        }
      }

      const newWorkbenchContent = { markdown: workbenchMarkdown };

      const [projectUpdateResult, workbenchUpdateResult] = await Promise.all([
        supabase
          .from("projects")
          .update({
            title: newTitle,
            last_activity: new Date().toISOString(),
          })
          .eq("id", id),

        supabase
          .from("workbench_content")
          .update({
            content: newWorkbenchContent,
            updated_at: new Date().toISOString(),
          })
          .eq("project_id", id),
      ]);

      if (projectUpdateResult.error) throw projectUpdateResult.error;
      if (workbenchUpdateResult.error) throw workbenchUpdateResult.error;
    } catch (error: any) {
      console.error("Auto-save error:", error);
      toast.error("Failed to save changes.", {
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  }, [editor, id, supabase]);

  useEffect(() => {
    if (!editor || !id) {
      return;
    }

    // PERBAIKAN 2: Logika pendaftaran dan pembersihan listener yang benar
    const initializeAutoSave = () => {
      if (isInitialized.current) return;

      const handleContentChange = () => {
        if (isRealtimeUpdate.current) {
          isRealtimeUpdate.current = false;
          return;
        }

        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
          saveChanges();
        }, 1500);
      };

      // onEditorContentChange mengembalikan fungsi unsubscribe
      const unsubscribe = editor.onEditorContentChange(handleContentChange);
      isInitialized.current = true;

      // useEffect cleanup function harus me-return fungsi unsubscribe itu sendiri
      return () => {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
        unsubscribe(); // Panggil fungsi unsubscribe di sini
        isInitialized.current = false;
      };
    };

    // Kita tambahkan sedikit delay untuk memastikan editor benar-benar siap
    const timer = setTimeout(() => {
      // Simpan fungsi cleanup yang dikembalikan oleh initializeAutoSave
      const cleanup = initializeAutoSave();
      // Pastikan cleanup dijalankan saat komponen unmount
      return () => {
        cleanup?.();
      };
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [editor, id, saveChanges, isRealtimeUpdate]);

  return { isSaving };
};
