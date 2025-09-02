// import { createAIExtension, setGlobalAIProvider } from "@blocknote/xl-ai";
// import "@blocknote/xl-ai/style.css";
// import { toast } from "sonner";

// // ✅ Daftarkan provider AI global (hanya sekali di-app)
// setGlobalAIProvider({
//   generate: async ({ prompt, selectedText, locale }) => {
//     console.log("AI Provider Called:", { prompt, selectedText, locale });
//     toast.info("AI provider is being called!");

//     try {
//       // 🔥 Ganti dengan endpoint API kamu sendiri
//       const response = await fetch("/api/ai/brainstorm", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ prompt, selectedText, language: locale }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "API request failed");
//       }

//       return data.text || "⚠️ No response text from AI";
//     } catch (err: any) {
//       console.error("Custom AI provider error:", err);
//       return "⚠️ AI provider error: " + (err.message || "Unknown error");
//     }
//   },
// });

// // ✅ Buat AI Extension untuk editor
// export const aiExtension = createAIExtension({
//   defaultLLMOptions: {
//     model: "custom-backend", // nama bebas, bukan model asli
//   },
// });

// src/lib/ai.ts
import { google } from "@ai-sdk/google";

export const gemini = google({
  apiKey: process.env.GEMINI_API_KEY!, // jangan taruh langsung API key di kode
});
