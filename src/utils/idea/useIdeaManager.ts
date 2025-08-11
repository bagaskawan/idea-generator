// src/utils/useIdeaManager.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { DataItem } from "@/utils/types";
import { createClient } from "@/utils/supabase/client";
import useUser from "@/hooks/useUser";

export function useIdeaManager() {
  const { user } = useUser();
  const [data, setData] = useState<DataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [elaboration, setElaboration] = useState<string | null>(null);
  const supabase = createClient();

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

      const formattedData = ideas.map((item) => ({
        id: item.id,
        name: item.title,
        description: item.description,
        createdAt: new Date(item.created_at),
        tags: item.tags || [],
        isStarred: item.is_starred || false,
        lastActivity: item.last_activity,
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

  const developIdea = async (item: DataItem) => {
    setIsApiLoading(true);
    setElaboration(null);
    try {
      const response = await fetch("/api/develop-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          description: item.description,
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
