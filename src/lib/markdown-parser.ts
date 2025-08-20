// src/lib/markdown-parser.ts

/**
 * Fungsi utilitas generik yang sudah DIPERBARUI untuk mengekstrak konten.
 * Regex ini sekarang lebih fleksibel dan bisa menangani spasi atau tanda **.
 * @param markdownText - String Markdown lengkap dari AI.
 * @param sectionTitle - Judul seksi yang ingin diekstrak (tanpa nomor).
 * @returns Konten dari seksi tersebut sebagai string.
 */
function extractSection(markdownText: string, sectionTitle: string): string {
  // Regex yang lebih fleksibel:
  // - `##\\s*`: Mencari ## diikuti spasi (opsional)
  // - `(?:\\*\\*)?`: Mencari tanda ** (opsional)
  // - `\\d+\\.\\s*`: Mencari angka dan titik diikuti spasi (opsional)
  const regex = new RegExp(
    `##\\s*(?:\\*\\*)?\\d+\\.\\s*${sectionTitle}(?:\\*\\*)?[\\s\\S]*?(?=(?:##\\s*(?:\\*\\*)?\\d+\\.|$))`,
    "i"
  );

  const match = markdownText.match(regex);

  if (!match) return "Section not found.";

  // Regex untuk menghapus baris heading dari hasil, juga lebih fleksibel
  const headingRegex = new RegExp(
    `##\\s*(?:\\*\\*)?\\d+\\.\\s*${sectionTitle}(?:\\*\\*)?`,
    "i"
  );
  return match[0].replace(headingRegex, "").trim();
}

// Fungsi-fungsi spesifik ini TIDAK PERLU DIUBAH, karena mereka menggunakan extractSection
export function getMainGoal(markdownText: string): string {
  return extractSection(
    markdownText,
    "(Main Application Goal|Tujuan Utama Aplikasi)"
  );
}

export function getUserFlow(markdownText: string): string {
  return extractSection(
    markdownText,
    "(How It Works \\(User Flow\\)|Cara Kerja \\(Alur Pengguna\\))"
  );
}

export function getMvpFeatures(markdownText: string): string {
  return extractSection(
    markdownText,
    "(MVP Features \\(Minimum Viable Product\\)|Fitur-Fitur MVP \\(Minimum Viable Product\\))"
  );
}

interface TechStackItem {
  name: string;
  tech: string;
  reason: string;
}

/**
 * Fungsi khusus untuk mem-parsing seksi Tech Stack menjadi array objek.
 * Regex di dalamnya juga sudah diperbarui.
 * @param markdownText - String Markdown lengkap dari AI.
 * @returns Array objek yang berisi detail tech stack.
 */
export function parseTechStack(markdownText: string): TechStackItem[] {
  const sectionText = extractSection(
    markdownText,
    "(Recommended Tech Stack|Rekomendasi Tech Stack)"
  );

  if (sectionText === "Section not found.") return [];

  const lines = sectionText.split("\n").filter((line) => line.trim() !== "");
  const techStack: TechStackItem[] = [];

  // Regex yang lebih fleksibel untuk mem-parsing setiap baris
  const lineRegex = /-\s*\*\*(.*?):\*\*\s*\[(.*?)]\s*-\s*\[(.*?)]/;

  lines.forEach((line) => {
    const match = line.match(lineRegex);
    if (match) {
      techStack.push({
        name: match[1].trim(), // e.g., "Frontend"
        tech: match[2].trim(), // e.g., "Next.js + TypeScript"
        reason: match[3].trim(), // e.g., "Alasan..."
      });
    }
  });

  return techStack;
}
