// src/components/dashboard/AddNewIdeaCard.tsx
"use client";

import Link from "next/link"; // <-- Impor Link
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

export function AddNewIdeaCard() {
  return (
    <Link href="/idea/generate" className="h-full">
      <Card
        className="bg-card rounded-lg border-2 border-dashed border-border hover:border-solid hover:border-primary 
                   hover:shadow-lg transition-all duration-300 cursor-pointer 
                   flex flex-col items-center justify-center h-full group"
      >
        <div className="p-6 text-center">
          <Plus
            className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors duration-300 mx-auto"
            strokeWidth={1.5}
          />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            Create New Idea
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Click here to add a new project idea.
          </p>
        </div>
      </Card>
    </Link>
  );
}
