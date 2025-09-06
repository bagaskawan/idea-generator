import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export const useAutoSave = (
  editor: any,
  id: string,
  isRealtimeUpdate: React.MutableRefObject<boolean>
) => {
  const supabase = createClient();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isInitialized = useRef(false);

  const saveChanges = useCallback(async () => {
    if (!editor) {
      console.error("Editor is not available");
      return;
    }

    setIsSaving(true);
    try {
      const blocks = editor.topLevelBlocks;
      let name = "";
      let description = "";

      if (blocks.length > 0) {
        const titleBlock = blocks[0];
        const titleContent =
          titleBlock.content?.map((c: any) => c.text).join("") || "";
        name = titleContent;

        if (blocks.length > 1) {
          const descriptionBlocks = blocks.slice(1);
          description = await editor.blocksToMarkdownLossy(descriptionBlocks);
        }
      }

      const { error } = await supabase
        .from("projects")
        .update({
          title: name,
          description: description,
          last_activity: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      // toast.success("Perubahan berhasil disimpan!");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error("Gagal menyimpan perubahan.", {
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

    // Pastikan editor sudah siap sebelum mendaftarkan listener
    const initializeAutoSave = () => {
      if (isInitialized.current) return;

      const handleContentChange = () => {
        if (isRealtimeUpdate.current) return;

        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
          saveChanges();
        }, 1500);
      };

      const unsubscribe = editor.onEditorContentChange(handleContentChange);
      isInitialized.current = true;

      return () => {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
        unsubscribe?.();
      };
    };

    // Timer untuk memastikan editor benar-benar siap
    const initTimer = setTimeout(initializeAutoSave, 500);

    return () => {
      clearTimeout(initTimer);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [editor, id, saveChanges, isRealtimeUpdate]);

  return { isSaving };
};
