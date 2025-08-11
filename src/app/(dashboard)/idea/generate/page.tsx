// src/app/(dashboard)/idea/new/page.tsx
"use client";

import AddIdeaForm from "@/components/forms/AddIdeaForm";
import { FullScreenModalWrapper } from "@/components/ui/FullScreenModalWrapper";
import { useIdeaManager } from "@/utils/useIdeaManager";
import { useRouter } from "next/navigation";

export default function GenerateIdeaPage() {
  const router = useRouter();
  const { addItem } = useIdeaManager();

  const handleAddIdea = async (title: string, description: string) => {
    addItem(title, description);
    router.back();
  };

  return (
    <FullScreenModalWrapper>
      <AddIdeaForm onSubmit={handleAddIdea} />
    </FullScreenModalWrapper>
  );
}
