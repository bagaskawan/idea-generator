import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Inisialisasi Gemini client dengan API Key dari environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST() {
  try {
    console.log("Mulai proses generate ide...");
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const prompt = `
      You are 'Architech', a highly experienced Chief Technology Officer (CTO) and Digital Product Architect. You excel at creating innovative, feasible, and impressive project blueprints for developers to build for their portfolios.
      Your task is to generate ONE complete project idea blueprint based on a user's field of interest. The project idea must be unique, modern, and contain an AI-driven feature. Avoid generic clichés like 'To-Do App', 'Weather App', or 'Simple Blog'.
    You will be given the following input:
    - user_interest_area: A field of interest provided by the user (e.g., "E-commerce", "Education Technology", "Smart Home / IoT", "Healthcare", "Personal Finance").
    Based on the user_interest_area, you must generate a project blueprint.

    The entire output MUST be a single, valid JSON object with two keys: "name" and "description".
      - The "name" key should contain a creative and professional title for the project idea.
      - The "description" key's value MUST be a string containing a detailed plan written in **Bahasa Indonesia** and formatted using the following exact markdown structure:

    ## **1. Tujuan Utama Aplikasi**
    [Jelaskan tujuan utama proyek di sini. Fokus pada masalah spesifik yang ingin diselesaikan dalam bidang yang diminati pengguna.]

    ## **2. Cara Kerja (Alur Pengguna)**
    [Jelaskan alur kerja langkah demi langkah dari perspektif pengguna. Buat sesederhana dan sejelas mungkin.]

    ## **3. Fitur-Fitur MVP (Minimum Viable Product)**
    - **Nama Fitur 1:** (Fungsi singkat). (Detail penjelasan mengenai fitur tersebut, apa masalah yang dipecahkannya, dan bagaimana cara kerjanya.)
    - **Nama Fitur 2:** (Fungsi singkat). (Detail penjelasan mengenai fitur tersebut, apa masalah yang dipecahkannya, dan bagaimana cara kerjanya.)
    - **Nama Fitur 3:** (Fungsi singkat). (Detail penjelasan mengenai fitur tersebut, apa masalah yang dipecahkannya, dan bagaimana cara kerjanya.)

    ## **4. Rekomendasi Tech Stack**
    - **Frontend:** [Sebutkan teknologi, misal: Next.js + TypeScript] - [Alasan singkat dan relevan mengapa teknologi ini dipilih untuk proyek ini].
    - **Backend:** [Sebutkan teknologi, misal: FastAPI (Python)] - [Alasan singkat dan relevan].
    - **Database:** [Sebutkan teknologi, misal: Supabase (PostgreSQL)] - [Alasan singkat dan relevan].
    - **AI/API:** [Sebutkan model atau API yang digunakan, misal: Google Gemini API atau model dari Hugging Face] - [Alasan singkat dan relevan].
    `;

    console.log("Prompt dibuat, mengirim request ke Gemini API...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Respons dari Gemini API diterima.");

    let text = response.text();

    // Membersihkan respons untuk memastikan formatnya adalah JSON string yang valid
    console.log("Membersihkan teks respons...");
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    console.log("Mem-parsing teks JSON...");
    const idea = JSON.parse(text);

    console.log("Mengirimkan ide yang sudah jadi ke client.");
    return NextResponse.json(idea);
  } catch (error) {
    console.error("Terjadi error saat generate ide dari Gemini:", error);
    return NextResponse.json(
      { error: "Failed to generate idea" },
      { status: 500 }
    );
  }
}
