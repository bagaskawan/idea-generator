import { Lightbulb } from "lucide-react";
import { useEffect } from "react";
import { GeneratingAnimation } from "@/components/shared/ui/generatinganimation";

interface LoadingStateProps {
  title: string;
  texts: string[];
}

export function LoadingState({ title, texts }: LoadingStateProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-4 z-[9999]">
      <div className="flex flex-col items-center justify-center text-center px-4 animate-in fade-in-50">
        <h2 className="text-2xl font-bold tracking-tight mb-2">{title}</h2>
        <div className="text-muted-foreground text-lg h-8">
          <GeneratingAnimation texts={texts} />
        </div>
      </div>
    </div>
  );
}
