// src/components/idea/detail/IdeaEditor.tsx
import { BlockNoteView } from "@blocknote/mantine";
import {
  FormattingToolbarController,
  FormattingToolbar,
  BlockTypeSelect,
  BasicTextStyleButton,
  TextAlignButton,
  CreateLinkButton,
  ColorStyleButton,
} from "@blocknote/react";
// import { AIToolbarController } from "@blocknote/xl-ai";
import { AIMenuController, AIToolbarButton } from "@blocknote/xl-ai";
import { BlockNoteEditor } from "@blocknote/core";
import { useBlocknoteTheme } from "@/hooks/detail-idea/useBlockNoteTheme";

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
    <BlockNoteView
      editor={editor}
      editable={!isReadOnly}
      theme={theme}
      formattingToolbar={false}
    >
      {!isReadOnly && (
        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar>
              <BlockTypeSelect key="blockTypeSelect" />
              <BasicTextStyleButton key="bold" basicTextStyle="bold" />
              <BasicTextStyleButton key="italic" basicTextStyle="italic" />
              <BasicTextStyleButton
                key="underline"
                basicTextStyle="underline"
              />
              <TextAlignButton key="left" textAlignment="left" />
              <TextAlignButton key="center" textAlignment="center" />
              <TextAlignButton key="right" textAlignment="right" />
              <ColorStyleButton key="color" />
              <CreateLinkButton key="link" />

              <AIToolbarButton />
            </FormattingToolbar>
          )}
        />
      )}
      {!isReadOnly && <AIMenuController />}
    </BlockNoteView>
  );
}
