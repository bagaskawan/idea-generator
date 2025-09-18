// src/app/(dashboard)/idea/new/page.tsx
"use client";

import AddIdeaForm from "@/components/idea/forms/AddIdeaForm";
import { FullScreenModalWrapper } from "@/components/ui/FullScreenModalWrapper";

export default function AddIdeaPage() {
  return (
    <FullScreenModalWrapper>
      <AddIdeaForm />
    </FullScreenModalWrapper>
  );
}
