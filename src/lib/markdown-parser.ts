// src/lib/markdown-parser.ts

/**
 * Versi FINAL dari fungsi extractSection.
 * Regex ini sekarang sangat fleksibel: nomor dan bold pada judul seksi bersifat opsional.
 */
function extractSection(markdownText: string, sectionTitle: string): string {
  // Regex ini mencari: ##, diikuti oleh bold (opsional), diikuti oleh nomor & titik (opsional),
  // lalu judul seksi yang kita cari.
  const regex = new RegExp(
    `##\\s*(?:\\*\\*)?(?:\\d+\\.\\s*)?${sectionTitle}(?:\\*\\*)?[\\s\\S]*?(?=(?:##\\s*(?:\\*\\*)?(?:\\d+\\.\\s*)?|$))`,
    "i"
  );

  const match = markdownText.match(regex);

  if (!match) return "Section not found.";

  // Regex untuk menghapus baris heading dari hasil, juga lebih fleksibel
  const headingRegex = new RegExp(
    `##\\s*(?:\\*\\*)?(?:\\d+\\.\\s*)?${sectionTitle}(?:\\*\\*)?`,
    "i"
  );
  return match[0].replace(headingRegex, "").trim();
}

// Fungsi-fungsi di bawah ini tidak berubah, karena mereka menggunakan extractSection yang sudah pintar.
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

export function parseTechStack(markdownText: string): TechStackItem[] {
  const sectionText = extractSection(
    markdownText,
    "(Recommended Tech Stack|Rekomendasi Tech Stack)"
  );

  if (sectionText === "Section not found.") return [];

  const lines = sectionText.split("\n").filter((line) => line.trim() !== "");
  const techStack: TechStackItem[] = [];

  const lineRegex = /-\s*\*\*(.*?):\*\*\s*\[(.*?)]\s*-\s*\[(.*?)]/;

  lines.forEach((line) => {
    const match = line.match(lineRegex);
    if (match) {
      techStack.push({
        name: match[1].trim(),
        tech: match[2].trim(),
        reason: match[3].trim(),
      });
    }
  });

  return techStack;
}
