// src/components/EditorComponents.tsx

"use client";

import { type BlockNoteEditor } from "@blocknote/core";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import {
  FormattingToolbar,
  FormattingToolbarController,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  getFormattingToolbarItems,
} from "@blocknote/react";
import {
  AIMenu,
  AIToolbarButton,
  getAISlashMenuItems,
  getDefaultAIMenuItems,
} from "@blocknote/xl-ai";
import { RiMagicFill } from "react-icons/ri";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

// Ganti dengan path import Anda yang benar
import {
  addRelatedTopics,
  makeInformal,
} from "@/components/shared/ai/CustomeAIMenuItems";

// Import utility functions for context extraction
import {
  findParentHeader,
  getTextBetweenHeaderAndBlock,
} from "@/lib/blocknoteHeaderUtils";

/**
 * Custom slash menu item: "Continue with AI"
 * Calls our FastAPI backend to generate a continuation of the current text
 */
function getContinueWithAISlashItem(editor: BlockNoteEditor) {
  return {
    title: "Continue with AI",
    subtext: "Let AI finish your sentence",
    onItemClick: async () => {
      // Get the current block's text content
      const cursorPosition = editor.getTextCursorPosition();
      const currentBlock = cursorPosition.block;

      // Get section context: from parent header to current block
      const parentHeader = findParentHeader(editor, currentBlock);
      let blockText = "";

      if (parentHeader) {
        // Use full section context from header to current position
        blockText = getTextBetweenHeaderAndBlock(
          editor,
          parentHeader,
          currentBlock
        );
      } else if (currentBlock.content && Array.isArray(currentBlock.content)) {
        // Fallback: use just current block text if no parent header
        blockText = currentBlock.content
          .map((item: { type: string; text?: string }) =>
            item.type === "text" ? item.text || "" : ""
          )
          .join("");
      }

      if (!blockText.trim()) {
        toast.warning("No context found", {
          description: "Please add a heading or some text first.",
        });
        return;
      }

      // Show loading toast
      const toastId = toast.loading("AI is thinking...", {
        description: "Generating continuation for your text",
      });

      try {
        // Call our FastAPI backend
        const response = await api.generateAICompletion(blockText);

        if (response.completion) {
          // Insert the AI completion as a new block after current block
          editor.insertBlocks(
            [
              {
                type: "paragraph",
                content: response.completion,
              },
            ],
            currentBlock,
            "after"
          );

          toast.success("AI continuation added!", {
            id: toastId,
            description: "The AI has continued your text.",
          });
        } else {
          toast.error("No completion received", {
            id: toastId,
            description: "The AI did not return any text.",
          });
        }
      } catch (error) {
        console.error("AI completion error:", error);
        toast.error("Failed to generate AI completion", {
          id: toastId,
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    },
    aliases: ["ai", "continue", "complete", "finish"],
    group: "AI",
    icon: <RiMagicFill size={18} />,
  };
}

export function CustomAIMenu() {
  return (
    <AIMenu
      items={(
        editor: BlockNoteEditor,
        aiResponseStatus:
          | "user-input"
          | "thinking"
          | "ai-writing"
          | "error"
          | "user-reviewing"
          | "closed"
      ) => {
        if (aiResponseStatus === "user-input") {
          if (editor.getSelection()) {
            return [
              ...getDefaultAIMenuItems(editor, aiResponseStatus),
              makeInformal(editor),
            ];
          } else {
            return [
              ...getDefaultAIMenuItems(editor, aiResponseStatus),
              addRelatedTopics(editor),
            ];
          }
        }
        return getDefaultAIMenuItems(editor, aiResponseStatus);
      }}
    />
  );
}

export function FormattingToolbarWithAI() {
  return (
    <FormattingToolbarController
      formattingToolbar={() => (
        <FormattingToolbar>
          {...getFormattingToolbarItems()}
          <AIToolbarButton />
        </FormattingToolbar>
      )}
    />
  );
}

export function SlashMenuWithAI({ editor }: { editor: BlockNoteEditor }) {
  return (
    <SuggestionMenuController
      triggerCharacter="/"
      getItems={async (query) =>
        filterSuggestionItems(
          [
            ...getDefaultReactSlashMenuItems(editor),
            ...getAISlashMenuItems(editor),
          ],
          query
        )
      }
    />
  );
}
