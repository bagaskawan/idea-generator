import { useEffect, useRef, useState } from "react";
import { Idea } from "@/utils/idea-detail/data";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import type { BlockNoteEditor } from "@blocknote/core";

export function useIdea(
  id: string | undefined,
  editor: BlockNoteEditor | null
) {
  const supabase = useSupabaseClient();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isContentLoaded = useRef(false);

  // Fetch idea data
  useEffect(() => {
    if (!id) return;

    const fetchIdea = async () => {
      setLoading(true);
      setError(null);
      isContentLoaded.current = false;

      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw new Error("Project not found or access denied.");

        const formatted: Idea = {
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

        setIdea(formatted);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
  }, [id, supabase]);

  // Sync description → editor
  useEffect(() => {
    const loadDescription = async () => {
      if (!editor || !idea?.description || isContentLoaded.current) return;

      const blocks = await editor.tryParseMarkdownToBlocks(idea.description);
      editor.replaceBlocks(editor.topLevelBlocks, blocks);
      isContentLoaded.current = true;
    };

    loadDescription();
  }, [editor, idea]);

  return { idea, setIdea, loading, error };
}
