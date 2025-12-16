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

/**
 * Mencari index dari sebuah blok di array topLevelBlocks.
 * @param blocks - Array blok top-level.
 * @param targetId - ID blok yang dicari.
 * @returns Index dari blok atau -1 jika tidak ditemukan.
 */
function findBlockIndex(blocks: Block[], targetId: string): number {
  return blocks.findIndex((block) => block.id === targetId);
}

/**
 * Mengambil semua blok antara dua blok (inklusif).
 * @param editor - Instance BlockNoteEditor.
 * @param startBlock - Blok awal (biasanya parentHeader).
 * @param endBlock - Blok akhir (biasanya currentBlock atau ancestornya).
 * @returns Array dari blok-blok yang berada di antara keduanya.
 */
export function getBlocksInRange(
  editor: BlockNoteEditor,
  startBlock: Block,
  endBlock: Block
): Block[] {
  const topLevelBlocks = editor.document;

  // Cari ancestor teratas dari endBlock (jika nested)
  let highestAncestor = endBlock;
  while (true) {
    const parent = searchForDirectParent(topLevelBlocks, highestAncestor.id);
    if (parent) {
      highestAncestor = parent;
    } else {
      break;
    }
  }

  const startIndex = findBlockIndex(topLevelBlocks, startBlock.id);
  const endIndex = findBlockIndex(topLevelBlocks, highestAncestor.id);

  if (startIndex === -1 || endIndex === -1) {
    return [];
  }

  // Pastikan startIndex <= endIndex
  const [from, to] =
    startIndex <= endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

  return topLevelBlocks.slice(from, to + 1);
}

/**
 * Mengambil semua teks dari parentHeader sampai currentBlock.
 * @param editor - Instance BlockNoteEditor.
 * @param parentHeader - Blok heading induk.
 * @param currentBlock - Blok saat ini (yang di-select).
 * @returns String berisi semua teks dari header sampai block saat ini.
 */
export function getTextBetweenHeaderAndBlock(
  editor: BlockNoteEditor,
  parentHeader: Block,
  currentBlock: Block
): string {
  const blocksInRange = getBlocksInRange(editor, parentHeader, currentBlock);

  const texts: string[] = [];

  // Recursive function untuk extract text dari block dan children-nya
  const extractText = (block: Block, depth: number = 0): void => {
    const indent = "  ".repeat(depth);
    const text = getBlockText(block);

    if (text) {
      // Tambahkan prefix berdasarkan tipe block
      if (block.type === "heading") {
        const level = (block.props as { level?: number })?.level || 1;
        texts.push(`${"#".repeat(level)} ${text}`);
      } else if (block.type === "bulletListItem") {
        texts.push(`${indent}- ${text}`);
      } else if (block.type === "numberedListItem") {
        texts.push(`${indent}1. ${text}`);
      } else if (block.type === "checkListItem") {
        const checked = (block.props as { checked?: boolean })?.checked;
        texts.push(`${indent}[${checked ? "x" : " "}] ${text}`);
      } else {
        texts.push(`${indent}${text}`);
      }
    }

    // Process children recursively
    if (block.children && block.children.length > 0) {
      for (const child of block.children) {
        extractText(child, depth + 1);
      }
    }
  };

  for (const block of blocksInRange) {
    extractText(block);
  }

  return texts.join("\n");
}

/**
 * Variant yang mengembalikan hanya teks di ANTARA (tidak termasuk header dan current block).
 */
export function getContextBetweenHeaderAndBlock(
  editor: BlockNoteEditor,
  parentHeader: Block,
  currentBlock: Block
): string {
  const blocksInRange = getBlocksInRange(editor, parentHeader, currentBlock);

  // Skip first (header) and last (current block) jika ada lebih dari 2 block
  if (blocksInRange.length <= 2) {
    return "";
  }

  const contextBlocks = blocksInRange.slice(1, -1);

  const texts: string[] = [];

  const extractText = (block: Block): void => {
    const text = getBlockText(block);
    if (text) {
      texts.push(text);
    }
    if (block.children) {
      for (const child of block.children) {
        extractText(child);
      }
    }
  };

  for (const block of contextBlocks) {
    extractText(block);
  }

  return texts.join("\n");
}
