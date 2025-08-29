// src/lib/blocknote-ai.ts
import { createAIExtension } from "@blocknote/xl-ai";
import "@blocknote/xl-ai/style.css";

export const aiExtension = createAIExtension({
  provider: {
    // Custom provider untuk call server-side API
    generate: async ({ prompt, selectedText, language }) => {
      try {
        const response = await fetch("/api/ai", {
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
