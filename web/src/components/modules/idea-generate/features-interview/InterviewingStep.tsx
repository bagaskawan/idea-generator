"use client";

import { Button } from "@/components/shared/ui/button";
import { ExpandingTextarea } from "@/components/shared/ui/expandingtextarea";
import { GeneratingAnimation } from "@/components/shared/ui/generatinganimation";
import { InterviewSessionState } from "@/types";

interface InterviewingStepProps {
  sessionState: InterviewSessionState;
  currentAnswer: string;
  setCurrentAnswer: (value: string) => void;
  handleContinue: () => void;
  isLoading: boolean;
}

export const InterviewingStep = ({
  sessionState,
  currentAnswer,
  setCurrentAnswer,
  handleContinue,
  isLoading,
}: InterviewingStepProps) => {
  const step = sessionState.conversationHistory.length + 1;
  const totalSteps = 3;
  const isLastStep = step >= totalSteps;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <GeneratingAnimation
          texts={[
            "Analyzing your answer...",
            "Formulating the next question...",
          ]}
          className="text-3xl font-semibold text-muted-foreground tracking-tight"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4 animate-in fade-in-50 text-center pb-24">
      <div className="max-w-4xl w-full mx-auto bg-card rounded-2xl p-8 border">
        <div className="flex justify-between items-start mb-10">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight dark:text-gray-100"></h2>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {step}/{totalSteps}
          </span>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleContinue();
          }}
          className="space-y-6"
        >
          <h2 className="text-2xl  md:text-3xl font-semibold text-foreground tracking-tight mb-10 text-left">
            {sessionState.currentQuestion}
          </h2>
          <ExpandingTextarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            autoFocus
            placeholder="Your answer..."
            disabled={isLoading}
          />
          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || !currentAnswer.trim()}
              size="lg"
            >
              {isLastStep ? "Generate Ideas" : "Next Step"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
