"use client";

import { AIIdeaOptionCard } from "@/components/modules/idea-generate/AIIdeaOptionCard";
import { IdeaOption } from "@/types";

interface ShowOptionsStepProps {
  ideaOptions: IdeaOption[];
  onSelect: (idea: IdeaOption) => void;
  isLoading: boolean;
}

export const ShowOptionsStep = ({
  ideaOptions = [],
  onSelect,
  isLoading,
}: ShowOptionsStepProps) => {
  if (!ideaOptions || !Array.isArray(ideaOptions)) {
    return (
      <div className="text-center py-20">
        <p>No ideas generated. Please try again.</p>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-24 sm:py-32 animate-in fade-in-0 slide-in-from-bottom-8 duration-700">
      <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-150">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground">
          Here Are a Few Directions
        </h1>
        <p className="text-lg text-muted-foreground mt-4">
          Based on our conversation, here are three concepts. Select one to
          instantly generate a complete project blueprint.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto text-left">
        {ideaOptions.map((idea, index) => (
          <div
            key={index}
            className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
            style={{
              animationDelay: `${300 + index * 150}ms`,
              animationFillMode: "backwards",
            }}
          >
            <AIIdeaOptionCard
              idea={idea}
              onSelect={() => onSelect(idea)}
              isLoading={isLoading}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
