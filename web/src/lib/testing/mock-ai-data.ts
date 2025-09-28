// Fungsi ini mensimulasikan penundaan jaringan agar loading terasa nyata
const createDelayedResponse = (data: any, delay = 1500) => {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
};

// Data tiruan untuk /api/ai/start-interview
export const mockStartInterviewResponse = () => {
  return createDelayedResponse({
    question:
      "Tentu, mari kita mulai. Apa masalah utama yang ingin Anda selesaikan dengan aplikasi ini?",
  });
};

// Data tiruan untuk /api/ai/continue-interview
export const mockContinueInterviewResponse = (historyLength: number) => {
  const questions = [
    "Sangat menarik. Siapa target pengguna utama yang akan mendapatkan manfaat paling besar dari solusi ini?",
    "Baik, terakhir, apa satu fitur unik yang akan membuat aplikasi Anda menonjol dari yang lain?",
  ];
  return createDelayedResponse({
    question: questions[historyLength] || "Pertanyaan lanjutan tiruan.",
  });
};

// Data tiruan untuk /api/ai/generate-idea-options
export const mockIdeaOptionsResponse = () => {
  return createDelayedResponse({
    ideas: [
      {
        projectName: "Arahku",
        uniqueSellingProposition:
          "Gamifikasi dan visualisasi peta yang unik untuk memotivasi pengguna.",
        projectDescription:
          "Aplikasi perencanaan yang menggunakan pendekatan gamifikasi untuk memotivasi pengguna...",
        mvpFeatures: [
          "Sistem to-do list terintegrasi.",
          "Sistem poin dan badge.",
          "Visualisasi progress via peta.",
          "Fitur berbagi progress.",
        ],
        icon: "rocket",
      },
      {
        projectName: "Jalanku",
        uniqueSellingProposition:
          "Kesederhanaan dan kemudahan penggunaan yang diprioritaskan.",
        projectDescription:
          "Aplikasi perencanaan yang menekankan pada kesederhanaan dan kemudahan penggunaan...",
        mvpFeatures: [
          "Antarmuka pengguna yang minimalis.",
          "Integrasi dengan kalender bawaan.",
          "Notifikasi reminder yang sederhana.",
          "Sistem to-do list & goal setting.",
        ],
        icon: "target",
      },
      {
        projectName: "Cahayaku",
        uniqueSellingProposition:
          "Integrasi fitur-fitur wellbeing untuk keseimbangan hidup.",
        projectDescription:
          "Aplikasi perencanaan yang berfokus pada wellbeing pengguna...",
        mvpFeatures: [
          "Sistem to-do list terintegrasi.",
          "Habit tracker untuk kebiasaan positif.",
          "Integrasi aplikasi kesehatan (opsional).",
          "Fitur meditasi terpandu (opsional).",
        ],
        icon: "heart",
      },
    ],
  });
};

// Anda bisa menambahkan data tiruan untuk /api/ai/generate-idea di sini jika perlu
