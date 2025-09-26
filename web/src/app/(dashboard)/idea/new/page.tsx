// src/app/(dashboard)/idea/new/page.tsx
"use client";

import AddIdeaForm from "@/components/modules/idea-generate/AddIdeaForm";
import { FullScreenModalWrapper } from "@/components/shared/ui/FullScreenModalWrapper";

export default function AddIdeaPage() {
  return (
    <FullScreenModalWrapper>
      <AddIdeaForm />
    </FullScreenModalWrapper>
  );
}
