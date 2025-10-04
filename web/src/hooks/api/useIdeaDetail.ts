import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/db/client";
import { IdeaDetail } from "@/types";

export const useIdea = (id: string) => {
  const [idea, setIdea] = useState<IdeaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchIdea = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch project data
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

      // Fetch workbench content
      const { data: workbenchData, error: workbenchError } = await supabase
        .from("workbench_content")
        .select("content")
        .eq("project_id", id)
        .single();

      if (workbenchError) {
        console.warn("Could not find workbench content for project:", id);
      }

      const { count: schemaCount, error: schemaError } = await supabase
        .from("database_schemas")
        .select("*", { count: "exact", head: true })
        .eq("project_id", id);

      if (schemaError) {
        console.error("Error checking for schema:", schemaError.message);
      }

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
        workbenchContent: workbenchData
          ? (workbenchData.content as { markdown: string })
          : null,
        hasSchema: (schemaCount ?? 0) > 0,
      };

      setIdea(formattedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, supabase]);

  useEffect(() => {
    fetchIdea();
  }, [fetchIdea]);

  return { idea, loading, error, refreshIdea: fetchIdea };
};
