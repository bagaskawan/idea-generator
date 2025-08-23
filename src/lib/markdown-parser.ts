// src/lib/markdown-parser.ts

function extractSection(markdownText: string, sectionTitle: string): string {
  const regex = new RegExp(
    `##\\s*(?:\\*\\*)?(?:\\d+\\.\\s*)?${sectionTitle}(?:\\*\\*)?[\\s\\S]*?(?=(?:##\\s*(?:\\*\\*)?(?:\\d+\\.\\s*)?|$))`,
    "i"
  );
  const match = markdownText.match(regex);
  if (!match) return "Section not found.";
  const headingRegex = new RegExp(
    `##\\s*(?:\\*\\*)?(?:\\d+\\.\\s*)?${sectionTitle}(?:\\*\\*)?`,
    "i"
  );
  return match[0].replace(headingRegex, "").trim();
}

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
    "(MVP Features \\(Minimum Viable Product\\)|MVP Features|Fitur-Fitur MVP)"
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

  // --- PERBAIKAN UTAMA DI SINI ---
  // Regex ini sekarang lebih fleksibel dan bisa menangkap format:
  // "- **Nama:** Teknologi - (Alasan)"
  const lineRegex = /-\s*\*\*(.*?):\*\*\s*([^-\(]+?)\s*-\s*\((.*?)\)/;

  lines.forEach((line) => {
    const match = line.match(lineRegex);
    if (match) {
      techStack.push({
        name: match[1].trim(), // e.g., "Backend"
        tech: match[2].trim(), // e.g., "Node.js with Express.js"
        reason: match[3].trim().replace(/\)$/, ""), // e.g., "Scalable and efficient..."
      });
    }
  });

  return techStack;
}
