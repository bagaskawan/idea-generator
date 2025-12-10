"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { addIdea } from "@/lib/actions/idea-actions";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import {
  ConversationTurn,
  IdeaOption,
  InterviewSessionState,
  InterviewStep,
  GeneratedBlueprint,
} from "@/types";

const sessionStorageKey = "interviewSessionState";

export const useInterviewMachine = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [sessionState, setSessionState] = useState<InterviewSessionState>({
    interest: "",
    conversationHistory: [],
    currentQuestion: "",
    ideaOptions: [],
    generatedBlueprint: null,
  });

  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, startSavingTransition] = useTransition();

  const currentStep = (searchParams.get("step") || "initial") as InterviewStep;

  useEffect(() => {
    try {
      const savedStateJSON = sessionStorage.getItem(sessionStorageKey);
      if (savedStateJSON) {
        setSessionState(JSON.parse(savedStateJSON));
      }
    } catch (error) {
      console.error("Failed to parse state from session:", error);
      sessionStorage.removeItem(sessionStorageKey);
    }
  }, []);

  const updateState = (
    step: InterviewStep,
    newState: Partial<InterviewSessionState>
  ) => {
    const updatedState = { ...sessionState, ...newState };
    setSessionState(updatedState);
    sessionStorage.setItem(sessionStorageKey, JSON.stringify(updatedState));

    if (step !== currentStep) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("step", step);
      router.push(`${pathname}?${newParams.toString()}`);
    }
  };

  const clearInterviewState = () => {
    sessionStorage.removeItem(sessionStorageKey);
    setSessionState({
      interest: "",
      conversationHistory: [],
      currentQuestion: "",
      ideaOptions: [],
      generatedBlueprint: null,
    });
    setCurrentAnswer("");
    router.push(pathname);
  };

  const handleStartInterview = async (interestValue: string) => {
    if (!interestValue.trim()) return;
    setIsLoading(true);
    updateState("generating", { interest: interestValue });

    try {
      const data = await api.startInterview(interestValue);
      updateState("interviewing", {
        interest: interestValue,
        currentQuestion: data.question,
        conversationHistory: [],
      });
    } catch (err: any) {
      toast.error("Error", { description: err.message });
      updateState("initial", {});
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueInterview = async () => {
    if (!currentAnswer.trim()) return;
    setIsLoading(true);
    const newHistory: ConversationTurn[] = [
      ...sessionState.conversationHistory,
      { question: sessionState.currentQuestion, answer: currentAnswer },
    ];
    setCurrentAnswer("");

    if (newHistory.length >= 3) {
      updateState("generating", { conversationHistory: newHistory });
      try {
        const data = await api.generateIdeas({
          interest: sessionState.interest,
          conversation: newHistory,
        });
        updateState("showOptions", {
          ideaOptions: data.ideas,
          conversationHistory: newHistory,
        });
      } catch (err: any) {
        toast.error("Error", { description: err.message });
        updateState("interviewing", {
          conversationHistory: sessionState.conversationHistory,
        });
      }
    } else {
      try {
        const data = await api.continueInterview(
          sessionState.interest,
          newHistory
        );
        updateState("interviewing", {
          conversationHistory: newHistory,
          currentQuestion: data.question,
        });
      } catch (err: any) {
        toast.error("Error", { description: err.message });
      }
    }
    setIsLoading(false);
  };

  const handleSelectIdea = async (selectedIdea: IdeaOption) => {
    setIsLoading(true);
    updateState("generating", {});
    try {
      const blueprint: GeneratedBlueprint = await api.generateBlueprint({
        ...selectedIdea,
        interest: sessionState.interest,
        conversation: sessionState.conversationHistory,
      });
      updateState("result", { generatedBlueprint: blueprint });
    } catch (err: any) {
      toast.error("Error", { description: err.message });
      updateState("showOptions", {});
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIdea = () => {
    if (!sessionState.generatedBlueprint) return;
    startSavingTransition(async () => {
      const result = await addIdea(sessionState.generatedBlueprint!);
      if (result.success && result.projectId) {
        toast.success("Blueprint saved successfully!");
        clearInterviewState();
        router.push(`/idea/${result.projectId}`);
      } else {
        toast.error("Failed to save blueprint", { description: result.error });
      }
    });
  };

  return {
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
  };
};
