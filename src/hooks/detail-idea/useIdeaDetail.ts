import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { DataItem } from "@/utils/types";

export const useIdea = (id: string) => {
  const [idea, setIdea] = useState<DataItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchIdea = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw new Error(
            "Proyek tidak ditemukan atau Anda tidak memiliki akses."
          );
        }

        const formattedData: DataItem = {
          id: data.id,
          name: data.title,
          description: data.description,
          createdAt: new Date(data.created_at),
          tags: data.tags || [],
          isStarred: data.is_starred || false,
          lastActivity: data.last_activity,
          status: data.status || "Idea",
          priority: data.priority || "Medium",
          tech_stack: data.tech_stack || [],
          cover_image_url: data.cover_image_url,
          repo_url: data.repo_url,
          live_url: data.live_url,
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
