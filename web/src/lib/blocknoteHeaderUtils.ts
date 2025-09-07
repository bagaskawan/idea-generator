// src/lib/blocknoteUtils.ts

import { type Block, type BlockNoteEditor } from "@blocknote/core";

/**
 * Mencari induk langsung dari sebuah blok di dalam properti `children`.
 * @param blocks - Array blok untuk dicari.
 * @param targetId - ID dari blok anak yang dicari induknya.
 * @returns Blok induk jika ditemukan, atau null.
 */
function searchForDirectParent(
  blocks: Block[],
  targetId: string
): Block | null {
  for (const block of blocks) {
    if (block.children.some((child) => child.id === targetId)) {
      return block;
    }
    const foundInChild = searchForDirectParent(block.children, targetId);
    if (foundInChild) {
      return foundInChild;
    }
  }
  return null;
}

/**
 * Menemukan heading utama yang menaungi sebuah blok, bahkan di dalam daftar bertingkat.
 * @param editor - Instance BlockNoteEditor.
 * @param startBlock - Blok awal untuk memulai pencarian.
 * @returns Blok heading utama atau null.
 */
export function findParentHeader(
  editor: BlockNoteEditor,
  startBlock: Block
): Block | null {
  // 1. Naik ke "nenek moyang" teratas dalam struktur nested
  let highestAncestor = startBlock;
  while (true) {
    const parent = searchForDirectParent(editor.document, highestAncestor.id);
    if (parent) {
      highestAncestor = parent;
    } else {
      break;
    }
  }

  if (highestAncestor.type === "heading") {
    return highestAncestor;
  }

  // 2. Dari nenek moyang teratas, berjalan mundur untuk mencari heading
  let currentBlock: Block | undefined = highestAncestor;
  while (currentBlock) {
    const previousBlock = editor.getPrevBlock(currentBlock);
    if (!previousBlock) {
      return null;
    }
    if (previousBlock.type === "heading") {
      return previousBlock;
    }
    currentBlock = previousBlock;
  }

  return null;
}

/**
 * Mengambil teks dari sebuah objek BlockNote secara manual.
 * @param block - Objek blok yang ingin diambil teksnya.
 * @returns String berisi teks dari blok tersebut.
 */
export function getBlockText(block: Block | null | undefined): string {
  if (!block || !block.content) {
    return "";
  }
  if (!Array.isArray(block.content)) {
    return "[Konten Tabel]"; // Menangani kasus TableContent
  }

  return block.content
    .filter((contentNode) => contentNode.type === "text")
    .map((contentNode) => contentNode.text)
    .join("");
}
