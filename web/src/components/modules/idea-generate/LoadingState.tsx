import { Lightbulb } from "lucide-react";
import { GeneratingAnimation } from "@/components/shared/ui/generatinganimation";

interface LoadingStateProps {
  title: string;
  texts: string[];
}

export function LoadingState({ title, texts }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4 animate-in fade-in-50 text-center pb-24">
      <div className="flex flex-col items-center justify-center text-center px-4 animate-in fade-in-50">
        <h2 className="text-2xl font-bold tracking-tight mb-2">{title}</h2>
        <div className="text-muted-foreground text-lg h-8">
          <GeneratingAnimation texts={texts} />
        </div>
      </div>
    </div>
  );
}
