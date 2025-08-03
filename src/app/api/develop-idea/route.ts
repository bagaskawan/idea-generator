import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Inisialisasi Gemini client dengan API Key dari environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "Nama dan deskripsi ide dibutuhkan." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const prompt = `
      You are 'Architech', a highly experienced Chief Technology Officer (CTO) and Digital Product Architect.
      Your task is to elaborate on an existing project idea. You need to expand upon the provided concept, making it more detailed and actionable for a developer.

      You will be given the following existing project idea:
      - Project Name: "${name}"
      - Project Description: "${description}"

      Based on this input, you must generate a more detailed and elaborated version of the project blueprint.
      Your elaboration should focus on:
      1.  **Advanced Features**: Suggest 2-3 new, advanced, or "nice-to-have" features that build upon the original MVP.
      2.  **User Stories**: Write a few key user stories to clarify user roles and interactions.
      3.  **Data Model**: Propose a simple database schema or data model.

      The entire output MUST be a single, valid JSON object with one key: "elaboration".
      - The "elaboration" key's value MUST be a string containing the detailed plan written in **Bahasa Indonesia** and formatted using the following exact markdown structure:

      ## 1. Fitur Lanjutan / "Nice-to-Have"
      [Jelaskan 2-3 fitur canggih atau tambahan yang bisa dikembangkan setelah MVP selesai. Jelaskan bagaimana fitur ini akan meningkatkan nilai aplikasi.]

      ## 2. User Stories Utama
      - **Sebagai [Tipe Pengguna], saya ingin [Melakukan Aksi] agar [Mendapatkan Manfaat].**
      - **Sebagai [Tipe Pengguna], saya ingin [Melakukan Aksi] agar [Mendapatkan Manfaat].**

      ## 3. Usulan Model Data / Skema Database
      [Gambarkan tabel-tabel utama, kolom-kolomnya, dan relasi antar tabel. Anda bisa menggunakan format sederhana seperti: **NamaTabel** (kolom1, kolom2, relasi_ke_tabel_lain_id).]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const developedIdea = JSON.parse(text);

    return NextResponse.json(developedIdea);
  } catch (error) {
    console.error("Error developing idea from Gemini:", error);
    return NextResponse.json(
      { error: "Failed to develop idea" },
      { status: 500 }
    );
  }
}
