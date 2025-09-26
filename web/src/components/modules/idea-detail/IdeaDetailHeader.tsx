import { Button } from "@/components/shared/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface IdeaDetailHeaderProps {
  isSaving?: boolean;
}

export default function IdeaDetailHeader({ isSaving }: IdeaDetailHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-12">
      <Link href="/dashboard" passHref>
        <Button variant="ghost" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Proyek</span>
        </Button>
      </Link>

      {isSaving && (
        <span className="text-sm text-muted-foreground">Menyimpan...</span>
      )}
    </header>
  );
}
