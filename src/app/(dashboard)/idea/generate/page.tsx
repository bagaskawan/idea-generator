"use client";

import AddIdeaForm from "@/components/forms/AddIdeaForm";
import { FullScreenModalWrapper } from "@/components/ui/FullScreenModalWrapper";

export default function GenerateIdeaPage() {
  return (
    <FullScreenModalWrapper>
      <AddIdeaForm />
    </FullScreenModalWrapper>
  );
}
