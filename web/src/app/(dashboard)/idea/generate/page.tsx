"use client";

import { FullScreenModalWrapper } from "@/components/shared/ui/FullScreenModalWrapper";
import AIInterviewDisplay from "@/components/modules/idea-generate/AIInterviewDisplay"; // Import the renamed component

export default function GenerateIdeaPage() {
  return (
    <FullScreenModalWrapper>
      <AIInterviewDisplay />
    </FullScreenModalWrapper>
  );
}
