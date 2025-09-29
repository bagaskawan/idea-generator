"use client";

import { Button } from "@/components/shared/ui/button";
import { Bot, Database, Loader2 } from "lucide-react";

interface GenerateSchemaButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export const GenerateSchemaButton = ({
  onClick,
  isLoading,
}: GenerateSchemaButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      variant="outline"
      className="w-full p-6 mt-8 border-green-500 text-green-500 hover:text-green-600 hover:bg-green-500/10"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Database className="w-4 h-4 mr-2" />
      )}
      Generate Database Schema with AI
    </Button>
  );
};
