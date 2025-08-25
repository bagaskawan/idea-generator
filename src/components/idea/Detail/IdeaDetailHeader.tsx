import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface IdeaDetailHeaderProps {
  onBack: () => void;
  isSaving?: boolean;
}

export default function IdeaDetailHeader({
  onBack,
  isSaving,
}: IdeaDetailHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-12">
      <Button
        variant="ghost"
        onClick={onBack}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Proyek</span>
      </Button>

      {isSaving && (
        <span className="text-sm text-muted-foreground">Menyimpan...</span>
      )}
    </header>
  );
}
