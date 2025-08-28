// src/components/ai/AIMenuDropdown.tsx
"use client";

import { useBlockNoteEditor } from "@blocknote/react";
import { toast } from "sonner";
import { Block } from "@blocknote/core";
import { useState } from "react";

type AIAction = {
  label: string;
  requestType: string;
};

const contextualActions: Record<string, AIAction[]> = {
  "user stories": [
    { label: "Buatkan Acceptance Criteria", requestType: "GENERATE_AC" },
    { label: "Identifikasi Edge Cases", requestType: "IDENTIFY_EDGE_CASES" },
  ],
  "mvp features": [
    { label: "Rincikan Kebutuhan Teknis", requestType: "ELABORATE_TECHNICAL" },
  ],
  "tech stack": [
    {
      label: "Bandingkan dengan Alternatif",
      requestType: "COMPARE_ALTERNATIVES",
    },
  ],
  default: [
    { label: "Elaborasi Poin Ini", requestType: "ELABORATE_TECHNICAL" },
  ],
};

type Props = { onClose: () => void };
export function AIMenuDropdown({ onClose }: Props) {
  const editor = useBlockNoteEditor();
  const [open, setOpen] = useState(false);

  const getCurrentSection = (): string => {
    const selection = editor.getSelection();
    if (!selection || selection.blocks.length === 0) return "default";

    let currentBlock: Block | undefined = selection.blocks[0];
    let headingBlock: Block | null = null;

    while (currentBlock) {
      if (currentBlock.type === "heading") {
        headingBlock = currentBlock;
        break;
      }
      if (!currentBlock.parentBlock) break;
      currentBlock = editor.getBlock(currentBlock.parentBlock.id);
    }

    if (headingBlock) {
      const headingText = (headingBlock.content || [])
        .map((c) => c.text)
        .join("")
        .toLowerCase();

      for (const key in contextualActions)
        if (key !== "default" && headingText.includes(key)) return key;
    }
    return "default";
  };

  const handleAIAction = async (requestType: string) => {
    const selectedText = editor.getSelectedText();
    if (!selectedText.trim()) {
      toast.info("Please select text to use the AI feature.");
      return;
    }

    const originalSelection = editor.getSelection();
    if (!originalSelection) return;

    const currentSection = getCurrentSection();
    const loadingToast = toast.loading("AI is thinking...");

    try {
      const allBlocks = editor.topLevelBlocks;
      const fullContext = await editor.blocksToMarkdownLossy(allBlocks);

      const response = await fetch("/api/ai/brainstorm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullContext,
          selectedText,
          section: currentSection,
          requestType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response from AI.");
      }

      const { aiResponse } = await response.json();

      editor.deleteRange(originalSelection);
      const newBlocks = await editor.tryParseMarkdownToBlocks(aiResponse);
      editor.insertBlocks(newBlocks, originalSelection.blocks[0].id, "after");

      toast.success("AI has refined your idea!", { id: loadingToast });
    } catch (error: any) {
      toast.error("AI Action Failed", {
        id: loadingToast,
        description: error.message,
      });
    } finally {
      setOpen(false);
    }
    onClose();
  };

  const sectionKey = getCurrentSection();
  const actionsToShow =
    contextualActions[sectionKey] || contextualActions.default;

  return (
    <div className="absolute top-full left-0 mt-1 z-50">
      <div className="bn-menu bn-menu-dropdown">
        {actionsToShow.map((action) => (
          <button
            key={action.requestType}
            className="bn-menu-item"
            onClick={() => {
              handleAIAction(action.requestType);
              onClose();
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
