"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { en } from "@blocknote/core/locales";
import { en as aiEn } from "@blocknote/xl-ai/locales";
import { AIExtension } from "@blocknote/xl-ai";
import { DefaultChatTransport } from "ai";

// Backend API URL - adjust for production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Konfigurasi AI Extension - menggunakan backend untuk LLM calls
const aiExtension = AIExtension({
  transport: new DefaultChatTransport({
    api: `${API_BASE_URL}/api/ai/chat`,
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
