"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { en } from "@blocknote/core/locales";
import { en as aiEn } from "@blocknote/xl-ai/locales";
import { AIExtension } from "@blocknote/xl-ai";
import { DefaultChatTransport } from "ai";

// Use Next.js API route for BlockNote AI (proper Vercel AI SDK integration)
const aiExtension = AIExtension({
  transport: new DefaultChatTransport({
    api: "/api/ai/chat", // Next.js API route
  }),
});

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
