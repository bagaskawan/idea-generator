"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { DataItem } from "@/utils/types";
import FullScreenLoading from "@/components/FullScreenLoading";
import Header from "@/components/custom/Header";

type IdeaDetailViewProps = {
  id: string;
};

export default function IdeaDetailView({ id }: IdeaDetailViewProps) {
  const supabase = createClient();
  const [idea, setIdea] = useState<DataItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIdea = async () => {
      if (!id) return;

      try {
        setLoading(true);
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

        if (data) {
          const formattedData: DataItem = {
            id: data.id,
            name: data.title,
            description: data.description,
            createdAt: new Date(data.created_at),
            tags: data.tags || [],
            isStarred: data.is_starred || false,
            lastActivity: data.last_activity,
          };
          setIdea(formattedData);
        } else {
          throw new Error("Proyek tidak ditemukan.");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
  }, [id, supabase]);

  if (loading) {
    return <FullScreenLoading text="Memuat detail ide..." />;
  }

  return (
    <div className="max-w-5xl mx-auto mt-12 flex flex-col items-center">
      {error && <div className="text-red-500 text-center">{error}</div>}
      {idea && (
        <div className="bg-white dark:bg-gray-800 px-6">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            {idea.name}
          </h1>
          <div className="flex items-center mb-4">
            {idea.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {idea.description}
          </p>
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Dibuat pada: {new Date(idea.createdAt).toLocaleDateString("id-ID")}
          </div>
        </div>
      )}
    </div>
  );
}
