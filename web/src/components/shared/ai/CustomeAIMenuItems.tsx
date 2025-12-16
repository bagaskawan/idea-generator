import { BlockNoteEditor } from "@blocknote/core";
import { AIMenuSuggestionItem, AIExtension } from "@blocknote/xl-ai";
import { RiApps2AddFill, RiEmotionHappyFill } from "react-icons/ri";

// Helper function to get AI extension from editor
const getAI = (editor: BlockNoteEditor) => editor.getExtension(AIExtension);

// Custom item to make the text more informal.
export const makeInformal = (
  editor: BlockNoteEditor
): AIMenuSuggestionItem => ({
  key: "make_informal",
  title: "Make Informal",
  aliases: ["informal", "make informal", "casual"],
  icon: <RiEmotionHappyFill size={18} />,
  onItemClick: async () => {
    await getAI(editor)?.invokeAI({
      userPrompt:
        "Give the selected text a more informal (casual) tone. Adapt the language used to the accepted sentence.",
      // Set to true to tell the LLM to specifically
      // use the selected content as context. Defaults
      // to false.
      useSelection: true,
    });
  },
  size: "small",
});

// Custom item to write about related topics.
export const addRelatedTopics = (
  editor: BlockNoteEditor
): AIMenuSuggestionItem => ({
  key: "add_related_topics",
  title: "Add Related Topics",
  // Aliases used when filtering AI Menu items from
  // text in prompt input.
  aliases: ["related topics", "find topics"],
  icon: <RiApps2AddFill size={18} />,
  onItemClick: async () => {
    await getAI(editor)?.invokeAI({
      userPrompt:
        "Think of some related topics to the current text and write a sentence about each.",
    });
  },
  size: "small",
});
