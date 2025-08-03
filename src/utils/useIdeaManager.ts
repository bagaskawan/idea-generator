"use client";

import { useState, useEffect } from "react";
import { DataItem } from "@/utils/types";
import { initialData } from "@/utils/data";

const LOCAL_STORAGE_KEY = "ideaData";

export function useIdeaManager() {
  const [data, setData] = useState<DataItem[]>([]);

  // Load data from localStorage on initial component mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      const loadedData = storedData
        ? JSON.parse(storedData).map((item: DataItem) => ({
            ...item,
            createdAt: new Date(item.createdAt),
          }))
        : initialData.map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt),
          }));
      setData(loadedData);
    } catch (error) {
      console.error(
        "Failed to load data from localStorage, using initial data.",
        error
      );
      setData(
        initialData.map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        }))
      );
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Save data to localStorage whenever it changes
  useEffect(() => {
    // Avoid saving the initial empty array before data is loaded
    if (data.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  const addItem = (name: string, description: string) => {
    const newItem: DataItem = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: new Date(),
    };
    setData((prev) => [newItem, ...prev]);
  };

  const deleteItem = (id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  return { data, addItem, deleteItem };
}
