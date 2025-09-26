// src/components/EditorComponents.tsx

"use client";

import { type BlockNoteEditor, filterSuggestionItems } from "@blocknote/core";
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

// Ganti dengan path import Anda yang benar
import {
  addRelatedTopics,
  makeInformal,
} from "@/components/shared/ai/CustomeAIMenuItems";

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
