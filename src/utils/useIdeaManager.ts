// src/utils/useIdeaManager.ts
"use client";

import { useState, useEffect } from "react";
import { DataItem } from "@/utils/types";
import { initialData } from "@/utils/data";

const LOCAL_STORAGE_KEY = "ideaData";

export function useIdeaManager() {
  const [data, setData] = useState<DataItem[]>([]);
  // State untuk loading awal dari localStorage
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  // State untuk loading saat berinteraksi dengan API (seperti developIdea)
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [elaboration, setElaboration] = useState<string | null>(null);

  // Efek untuk memuat data dari localStorage saat komponen pertama kali mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      const loadedData = storedData
        ? JSON.parse(storedData).map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
          }))
        : initialData.map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt),
          }));
      setData(loadedData);
    } catch (error) {
      console.error("Failed to load data from localStorage.", error);
      setData(
        initialData.map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        }))
      );
    } finally {
      setIsInitialLoading(false); // Selesai loading awal
    }
  }, []);

  // Efek untuk menyimpan data ke localStorage setiap kali ada perubahan
  useEffect(() => {
    if (!isInitialLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isInitialLoading]);

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
    isLoading: isInitialLoading, // Loading untuk data awal
    isApiLoading, // Loading untuk aksi API
    addItem, // <-- Sekarang addItem sudah dikembalikan
    deleteItem, // <-- deleteItem juga
    developIdea, // <-- developIdea juga
    elaboration,
    setElaboration,
  };
}
