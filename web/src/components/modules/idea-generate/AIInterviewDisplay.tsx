"use client";

import { Suspense } from "react";
import { useInterviewMachine } from "@/hooks/features/useInterviewMachine";
import { LoadingState } from "@/components/modules/idea-generate/LoadingState";

// Dynamic imports for better performance
import { InitialStep } from "@/components/modules/idea-generate/features-interview/InititalStep";
import { InterviewingStep } from "@/components/modules/idea-generate/features-interview//InterviewingStep";
import { ShowOptionsStep } from "@/components/modules/idea-generate/features-interview//ShowOptionsStep";
import { ResultStep } from "@/components/modules/idea-generate/features-interview//ResultStep";

function AIInterviewDisplayContent() {
  const {
    currentStep,
    sessionState,
    isLoading,
    isSaving,
    currentAnswer,
    setCurrentAnswer,
    handleStartInterview,
    handleContinueInterview,
    handleSelectIdea,
    handleSaveIdea,
    clearInterviewState,
  } = useInterviewMachine();

  if (currentStep === "generating") {
    return (
      <LoadingState
        title="AI is Architecting..."
        texts={[
          "Building the blueprint...",
          "Structuring the roadmap...",
          "Defining the tech stack...",
          "Finalizing the details...",
        ]}
      />
    );
  }

  switch (currentStep) {
    case "interviewing":
      return (
        <InterviewingStep
          sessionState={sessionState}
          currentAnswer={currentAnswer}
          setCurrentAnswer={setCurrentAnswer}
          handleContinue={handleContinueInterview}
          isLoading={isLoading}
        />
      );
    case "showOptions":
      return (
        <ShowOptionsStep
          ideaOptions={sessionState.ideaOptions}
          onSelect={handleSelectIdea}
          isLoading={isLoading}
        />
      );
    case "result":
      return sessionState.generatedBlueprint ? (
        <ResultStep
          blueprint={sessionState.generatedBlueprint}
          onSave={handleSaveIdea}
          onRestart={clearInterviewState}
          isSaving={isSaving}
        />
      ) : (
        // Fallback jika blueprint tidak ada tapi step adalah result
        <LoadingState title="Loading blueprint..." texts={[]} />
      );
    case "initial":
    default:
      return (
        <InitialStep
          handleStart={handleStartInterview}
          isLoading={isLoading}
          defaultInterest={sessionState.interest}
        />
      );
  }
}

// Final wrapper component
export function AIInterviewDisplay() {
  return (
    <Suspense
      fallback={<LoadingState title="Loading Architect..." texts={[]} />}
    >
      <AIInterviewDisplayContent />
    </Suspense>
  );
}
