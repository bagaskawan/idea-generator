// src/components/modules/idea-generate/AIIdeaOptionCard.tsx

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent, // <-- Impor CardContent
} from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { ArrowRight, CheckCircle2, Icon } from "lucide-react"; // <-- Impor ikon baru

// --- PERBAIKAN 1: Sesuaikan Tipe dengan JSON yang Anda berikan ---
export type IdeaOption = {
  projectName: string;
  projectDescription: string; // Deskripsi ini tidak ditampilkan, tapi bagus untuk data
  uniqueSellingProposition: string;
  mvpFeatures: string[]; // Ini adalah kunci yang ada di JSON Anda
};

interface AIIdeaOptionCardProps {
  idea: IdeaOption;
  onSelect: () => void;
  isLoading: boolean;
}

export function AIIdeaOptionCard({
  idea,
  onSelect,
  isLoading,
}: AIIdeaOptionCardProps) {
  return (
    // --- PERBAIKAN 2: Desain Kartu yang Lebih Interaktif dan Premium ---
    <div
      onClick={!isLoading ? onSelect : undefined} // Seluruh kartu bisa diklik
      className="group relative flex flex-col h-full bg-card border rounded-2xl cursor-pointer
                 shadow-sm hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300"
    >
      {/* Efek gradien saat hover */}
      <div className="absolute top-0 left-0 w-full h-full rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="p-6 flex-grow flex flex-col z-10">
        <CardHeader className="p-0">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {idea.projectName}
          </CardTitle>
          <CardDescription className="pt-2 text-base text-muted-foreground">
            {idea.uniqueSellingProposition}
          </CardDescription>
        </CardHeader>

        {/* --- PERBAIKAN 3: Tampilkan Fitur MVP --- */}
        <CardContent className="p-0 pt-6 flex-grow">
          <p className="text-sm font-semibold text-foreground mb-3">
            Key Features:
          </p>
          <ul className="space-y-2">
            {idea.mvpFeatures.map((feature, index) => (
              <li
                key={index}
                className="flex items-start text-muted-foreground"
              >
                <CheckCircle2 className="w-4 h-4 mr-3 mt-1 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className="p-0 mt-8">
          <div
            className="w-full h-12 text-base font-semibold flex items-center justify-center 
                       bg-primary text-primary-foreground rounded-lg transition-all duration-300
                       group-hover:bg-primary/90"
          >
            Generate Blueprint
            <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </CardFooter>
      </div>
    </div>
  );
}
