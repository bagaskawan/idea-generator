import { BlockNoteEditor, BlockNoteView } from "@blocknote/react";

interface Props {
  editor: BlockNoteEditor | null;
}

export default function IdeaContent({ editor }: Props) {
  if (!editor) return null;

  return (
    <div className="prose max-w-none">
      <BlockNoteView editor={editor} />
    </div>
  );
}
