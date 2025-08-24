// src/components/ai/AIMenuButton.tsx
"use client";

import { useBlockNoteEditor } from "@blocknote/react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export function AIMenuButton() {
  const editor = useBlockNoteEditor();

  const handleRegenerate = async () => {
    const selectedText = editor.getSelectedText();
    const allBlocks = editor.topLevelBlocks;

    if (!selectedText.trim()) {
      toast.info("Please select text to regenerate.");
      return;
    }

    const selection = editor.selection;
    if (!selection) {
      toast.info("Please select text to regenerate.");
      return;
    }

    editor.insertInlineContent([
      {
        type: "text",
        text: "🤖 Regenerating...",
        styles: { bold: true, italic: true },
      },
    ]);

    try {
      const fullContext = await editor.blocksToMarkdownLossy(allBlocks);
      const response = await fetch("/api/regenerate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedText, fullContext }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI.");
      }

      const { regeneratedText } = await response.json();

      editor.setTextCursorPosition(selection.start);
      editor.delete(selection);
      editor.insertInlineContent(regeneratedText);
    } catch (error: any) {
      toast.error("AI Regeneration Failed", {
        description: error.message,
      });
      // Restore original text if regeneration fails
      editor.setTextCursorPosition(selection.start);
      editor.delete(selection);
      editor.insertInlineContent(selectedText);
    }
  };

  return (
    <button
      onClick={handleRegenerate}
      className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-md"
      type="button"
    >
      <Sparkles className="w-5 h-5 text-purple-500" />
    </button>
  );
}