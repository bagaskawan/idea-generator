import { BlockNoteView } from "@blocknote/mantine";
import {
  FormattingToolbarController,
  FormattingToolbar,
  BasicTextStyleButton,
  BlockTypeSelect,
  TextAlignButton,
  CreateLinkButton,
  ColorStyleButton,
} from "@blocknote/react";
import { AIMenuButton } from "@/components/ai/AIMenuButton";
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
  const theme = useBlocknoteTheme(); // <-- Gunakan hook untuk mendapatkan tema

  return (
    <BlockNoteView
      editor={editor}
      editable={!isReadOnly}
      theme={theme} // <-- Terapkan tema dinamis
      formattingToolbar={false}
    >
      {!isReadOnly && (
        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar>
              <BlockTypeSelect key="blockTypeSelect" />
              <BasicTextStyleButton
                key="boldStyleButton"
                basicTextStyle="bold"
              />
              <BasicTextStyleButton
                key="italicStyleButton"
                basicTextStyle="italic"
              />
              <BasicTextStyleButton
                key="underlineStyleButton"
                basicTextStyle="underline"
              />
              <TextAlignButton key="textAlignLeftButton" textAlignment="left" />
              <TextAlignButton
                key="textAlignCenterButton"
                textAlignment="center"
              />
              <TextAlignButton
                key="textAlignRightButton"
                textAlignment="right"
              />
              <ColorStyleButton key="colorStyleButton" />
              <CreateLinkButton key="createLinkButton" />
              <AIMenuButton />
            </FormattingToolbar>
          )}
        />
      )}
    </BlockNoteView>
  );
}
