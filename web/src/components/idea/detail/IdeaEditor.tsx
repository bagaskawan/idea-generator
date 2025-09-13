// src/components/IdeaEditor.tsx

"use client";

import { useBlocknoteTheme } from "@/hooks/detail-idea/useBlockNoteTheme";
import { type BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { AIMenuController } from "@blocknote/xl-ai";
import "@/styles/styles.css";

import {
  CustomAIMenu,
  FormattingToolbarWithAI,
  SlashMenuWithAI,
} from "@/components/idea/detail/EditorComponents";
import { useParentHeaderDetector } from "@/hooks/detail-idea/useParentHeaderDetector";
import { Skeleton } from "@/components/ui/skeleton";

interface IdeaEditorProps {
  editor: BlockNoteEditor;
  isReadOnly?: boolean;
}

export default function IdeaEditor({
  editor,
  isReadOnly = false,
}: IdeaEditorProps) {
  const theme = useBlocknoteTheme();
  const { debouncedSelectionChange } = useParentHeaderDetector(editor);

  if (!editor) {
    return (
      <div className="pt-4 space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full p-4 mb-4 font-barlow">
      <BlockNoteView
        editor={editor}
        formattingToolbar={false}
        slashMenu={false}
        editable={!isReadOnly}
        theme={theme}
        onSelectionChange={debouncedSelectionChange}
      >
        <AIMenuController aiMenu={CustomAIMenu} />
        <FormattingToolbarWithAI />
        <SlashMenuWithAI editor={editor} />
      </BlockNoteView>
    </div>
  );
}
