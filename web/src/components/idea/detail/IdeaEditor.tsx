"use client";

import { useBlocknoteTheme } from "@/hooks/detail-idea/useBlockNoteTheme";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { BlockNoteEditor, filterSuggestionItems } from "@blocknote/core";
// import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  FormattingToolbar,
  FormattingToolbarController,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  getFormattingToolbarItems,
} from "@blocknote/react";
import "@blocknote/react/style.css";
import {
  AIMenuController,
  AIToolbarButton,
  getAISlashMenuItems,
} from "@blocknote/xl-ai";
import "@blocknote/xl-ai/style.css";
import "@/styles/styles.css";

const google = createGoogleGenerativeAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
});
const model = google("gemini-1.5-flash-latest");

interface IdeaEditorProps {
  editor: BlockNoteEditor;
  isReadOnly?: boolean;
}

export default function IdeaEditor({
  editor,
  isReadOnly = false,
}: IdeaEditorProps) {
  const theme = useBlocknoteTheme();
  return (
    <div className="w-full p-4 mb-4 font-barlow">
      <BlockNoteView
        editor={editor}
        formattingToolbar={false}
        slashMenu={false}
        editable={!isReadOnly}
        theme={theme}
        data-changing-font-demo
      >
        <AIMenuController />
        <FormattingToolbarWithAI />
        <SlashMenuWithAI editor={editor} />
      </BlockNoteView>
    </div>
  );
}

function FormattingToolbarWithAI() {
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

function SlashMenuWithAI({
  editor,
}: {
  editor: BlockNoteEditor<any, any, any>;
}) {
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
