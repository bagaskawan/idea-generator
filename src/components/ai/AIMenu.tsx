// src/components/ai/AIMenu.tsx
import { BlockNoteEditor } from "@blocknote/core";
import { createReactInlineContentSpec } from "@blocknote/react";
import { Sparkles } from "lucide-react";

export const AIMenu = createReactInlineContentSpec(
  {
    type: "aiMenu",
    propSchema: {},
    content: "none",
  },
  {
    render: (props) => {
      const handleRegenerate = async () => {
        const selection = props.editor.getTextCursorPosition().selection;
        const selectedText = props.editor.getSelectedText();
        const fullContext = await props.editor.blocksToMarkdownLossy(
          props.editor.topLevelBlocks
        );

        // Ganti blok yang dipilih dengan indikator loading
        props.editor.replaceBlocks(selection, [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "🤖 Regenerating...",
                styles: { italic: true },
              },
            ],
          },
        ]);

        // Panggil API
        const response = await fetch("/api/regenerate-section", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedText, fullContext }),
        });

        const { regeneratedText } = await response.json();

        // Konversi hasil markdown kembali ke format block
        const newBlocks = await props.editor.tryParseMarkdownToBlocks(
          regeneratedText
        );

        // Ganti indikator loading dengan hasil dari AI
        props.editor.replaceBlocks(selection, newBlocks);
      };

      return (
        <div className="bg-white p-1 rounded-md shadow-lg border">
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-2 p-2 text-sm hover:bg-gray-100 rounded-md"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            Regenerate
          </button>
        </div>
      );
    },
  }
);
