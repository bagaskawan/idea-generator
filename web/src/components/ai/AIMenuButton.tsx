// src/components/ai/AIMenuButton.tsx

const contextualActions: Record<string, AIAction[]> = {
  "user stories": [
    { label: "Buatkan Acceptance Criteria", requestType: "GENERATE_AC" },
    { label: "Identifikasi Edge Cases", requestType: "IDENTIFY_EDGE_CASES" },
    {
      label: "Perbaiki Kalimat (Improve Writing)",
      requestType: "IMPROVE_WRITING",
    },
  ],
  "mvp features": [
    { label: "Rincikan Kebutuhan Teknis", requestType: "ELABORATE_TECHNICAL" },
    {
      label: "Tulis User Story untuk Fitur Ini",
      requestType: "FEATURE_TO_USER_STORY",
    },
  ],
  "tech stack": [
    {
      label: "Bandingkan dengan Alternatif",
      requestType: "COMPARE_ALTERNATIVES",
    },
    {
      label: "Jelaskan Potensi Masalah Skalabilitas",
      requestType: "SCALABILITY_CONCERNS",
    },
  ],
  default: [
    { label: "Elaborasi Poin Ini", requestType: "ELABORATE_TECHNICAL" },
    { label: "Sederhanakan Bahasa", requestType: "SIMPLIFY_LANGUAGE" },
    {
      label: "Lanjutkan Penulisan (Continue Writing)",
      requestType: "CONTINUE_WRITING",
    },
  ],
};
