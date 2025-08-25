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
import { useTheme } from "next-themes";
import { AIMenuButton } from "@/components/ai/AIMenuButton";
import { BlockNoteEditor } from "@blocknote/core";

interface IdeaEditorProps {
  editor: BlockNoteEditor;
  isReadOnly?: boolean;
}

export default function IdeaEditor({
  editor,
  isReadOnly = false,
}: IdeaEditorProps) {
  const { theme } = useTheme();

  return (
    <BlockNoteView
      editor={editor}
      editable={!isReadOnly}
      theme={theme === "dark" ? "dark" : "light"}
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