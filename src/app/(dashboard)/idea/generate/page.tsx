"use client";

import { FullScreenModalWrapper } from "@/components/ui/FullScreenModalWrapper";
import GenerateIdeaDisplay from "@/components/forms/GenerateIdeaDisplay"; // Import the renamed component

export default function GenerateIdeaPage() {
  return (
    <FullScreenModalWrapper>
      <GenerateIdeaDisplay />
    </FullScreenModalWrapper>
  );
}
