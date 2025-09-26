// src/hooks/useParentHeaderDetector.ts

import { useCallback, useRef } from "react";
import { type BlockNoteEditor } from "@blocknote/core";
import { findParentHeader, getBlockText } from "@/lib/blocknoteHeaderUtils";

export function useParentHeaderDetector(editor: BlockNoteEditor) {
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSelectionChange = useCallback(() => {
    if (!editor) return;

    const currentBlock = editor.getTextCursorPosition().block;
    if (!currentBlock) return;

    const parentHeader = findParentHeader(editor, currentBlock);

    console.clear();
    console.log("📍 Blok Saat Ini:", getBlockText(currentBlock));

    if (parentHeader) {
      const headerText = getBlockText(parentHeader);
      console.log("⬆️ Induk Ditemukan:", headerText, parentHeader);
    } else {
      console.log("⬆️ Tidak ada heading/induk yang ditemukan.");
    }
  }, [editor]);

  const debouncedSelectionChange = useCallback(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(handleSelectionChange, 1000);
  }, [handleSelectionChange]);

  return { debouncedSelectionChange };
}
