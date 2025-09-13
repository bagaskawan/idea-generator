import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { IdeaDetail } from "@/utils/types"; // Gunakan tipe baru

export const useIdea = (id: string) => {
  // State sekarang akan menampung tipe IdeaDetail yang lebih kompleks
  const [idea, setIdea] = useState<IdeaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchIdea = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        // Langkah 1: Ambil data utama dari tabel 'projects'
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (projectError) {
          throw new Error(
            "Proyek tidak ditemukan atau Anda tidak memiliki akses."
          );
        }

        // Langkah 2: Ambil konten workbench dari tabel 'workbench_content'
        const { data: workbenchData, error: workbenchError } = await supabase
          .from("workbench_content")
          .select("content")
          .eq("project_id", id)
          .single();

        if (workbenchError) {
          // Tidak melempar error jika workbench kosong, anggap saja kontennya null
          console.warn("Could not find workbench content for project:", id);
        }

        // Langkah 3: Gabungkan kedua data menjadi satu objek IdeaDetail
        const formattedData: IdeaDetail = {
          id: projectData.id,
          title: projectData.title,
          problem_statement: projectData.problem_statement,
          target_audience: projectData.target_audience || [],
          success_metrics: projectData.success_metrics || [],
          tech_stack: projectData.tech_stack || [],
          tags: projectData.tags || [],
          is_starred: projectData.is_starred || false,
          last_activity: projectData.last_activity,
          status: projectData.status || "Idea",
          priority: projectData.priority || "Medium",
          cover_image_url: projectData.cover_image_url,
          repo_url: projectData.repo_url,
          live_url: projectData.live_url,
          created_at: new Date(projectData.created_at),
          // Ambil konten dari 'content.markdown' jika ada
          workbenchContent: workbenchData
            ? (workbenchData.content as { markdown: string })
            : null,
        };

        setIdea(formattedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
  }, [id, supabase]);

  return { idea, loading, error };
};
