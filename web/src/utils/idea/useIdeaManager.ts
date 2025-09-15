"use client";

import { useState, useEffect, useCallback } from "react";
import { ProjectData } from "@/utils/types";
import { createClient } from "@/utils/supabase/client";
import useUser from "@/hooks/useUser";

export function useIdeaManager() {
  const { user } = useUser();
  const [data, setData] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [elaboration, setElaboration] = useState<string | null>(null);
  const supabase = createClient();

  //List Data Project
  const fetchIdeas = useCallback(async () => {
    if (!user) {
      setIsLoading(true);
      return;
    }
    setIsLoading(true);
    try {
      const { data: ideas, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedData: ProjectData[] = ideas.map((item) => ({
        id: item.id,
        title: item.title,
        problem_statement: item.problem_statement,
        created_at: new Date(item.created_at),
        tags: item.tags || [],
        is_starred: item.is_starred || false,
        last_activity: item.last_activity,
        target_audience: item.target_audience || [],
        success_metrics: item.success_metrics || [],
        tech_stack: item.tech_stack || [],
        status: item.status || "Idea",
        priority: item.priority || "Medium",
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Failed to load data from Supabase.", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas, user]);

  const addItem = async (name: string, description: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("User not authenticated for adding item.");
        return;
      }

      const newItem = {
        user_id: user.id,
        title: name,
        description,
        tags: ["New"],
        is_starred: false,
        last_activity: new Date().toISOString(),
      };

      const { error } = await supabase.from("projects").insert(newItem);

      if (error) {
        throw error;
      }

      // Refresh data after adding
      fetchIdeas();
    } catch (error) {
      console.error("Failed to add item to Supabase", error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from("projects").delete().match({ id });

      if (error) {
        throw error;
      }

      // Refresh data after deleting
      fetchIdeas();
    } catch (error) {
      console.error("Failed to delete item from Supabase", error);
    }
  };

  const developIdea = async (item: ProjectData) => {
    setIsApiLoading(true);
    setElaboration(null);
    try {
      const response = await fetch("/api/ai/develop-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.title,
          description: item.problem_statement,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch elaboration");
      }
      const result = await response.json();
      setElaboration(result.elaboration);
    } catch (error) {
      console.error("Error developing idea:", error);
    } finally {
      setIsApiLoading(false);
    }
  };

  return {
    data,
    isLoading,
    isApiLoading,
    addItem,
    deleteItem,
    developIdea,
    elaboration,
    setElaboration,
  };
}
