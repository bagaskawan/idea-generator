"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { en } from "@blocknote/core/locales";
import { en as aiEn } from "@blocknote/xl-ai/locales";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAIExtension } from "@blocknote/xl-ai";

// Konfigurasi AI di luar hook agar tidak dibuat ulang pada setiap render
const google = createGoogleGenerativeAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
});
const model = google("gemini-2.5-flash");
const aiExtension = createAIExtension({ model });

/**
 * Custom hook untuk membuat dan mengonfigurasi editor BlockNote dengan fitur AI.
 */
const dictionary = { ...en, ai: aiEn };

/**
 * Custom hook untuk membuat dan mengonfigurasi editor BlockNote dengan fitur AI.
 */
export function useBlocknoteEditor() {
  const editor = useCreateBlockNote({
    dictionary,
    extensions: [aiExtension],
  });

  return editor;
}
