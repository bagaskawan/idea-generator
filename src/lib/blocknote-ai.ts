// src/lib/blocknote-ai.ts
import { createAIExtension } from "@blocknote/xl-ai";
import "@blocknote/xl-ai/style.css";
import { toast } from "sonner";

export const aiExtension = createAIExtension({
  provider: {
    // Custom provider untuk call server-side API
    generate: async ({ prompt, selectedText, language }) => {
      console.log(prompt, selectedText, language);
      toast.info("masuk");
      return null;
      try {
        const response = await fetch("/api/ai/brainstorm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, selectedText, language }),
        });

        if (!response.ok) {
          throw new Error("API request failed");
        }

        const { text } = await response.json();
        return text;
      } catch (error) {
        console.error("Custom AI provider error:", error);
        throw error; // Ini akan trigger "Oops" dengan logging
      }
    },
  },
});
