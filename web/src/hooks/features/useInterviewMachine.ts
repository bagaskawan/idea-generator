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
  ChatMessage,
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
    messages: [],
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
      messages: [],
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

      // Add user's initial interest as first message
      const userInterestMessage: ChatMessage = {
        id: `msg-${Date.now()}-interest`,
        role: "user",
        content: interestValue,
        timestamp: new Date(),
      };

      // Add AI's first question as second message
      const aiQuestionMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: data.question,
        timestamp: new Date(),
      };

      updateState("interviewing", {
        interest: interestValue,
        currentQuestion: data.question,
        conversationHistory: [],
        messages: [userInterestMessage, aiQuestionMessage],
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

    const newHistory: ConversationTurn[] = [
      ...sessionState.conversationHistory,
      { question: sessionState.currentQuestion, answer: currentAnswer },
    ];

    // Add user's answer to messages
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: currentAnswer,
      timestamp: new Date(),
    };
    const updatedMessages = [...sessionState.messages, userMessage];

    // Clear input and show user message first
    setCurrentAnswer("");

    // Update state to show user message immediately
    updateState("interviewing", {
      conversationHistory: sessionState.conversationHistory,
      currentQuestion: sessionState.currentQuestion,
      messages: updatedMessages,
    });

    // Then start loading
    setIsLoading(true);

    if (newHistory.length >= 3) {
      // Stay in interviewing state, don't switch to generating
      // Add a message indicating we're generating ideas
      const generatingMessage: ChatMessage = {
        id: `msg-${Date.now()}-generating`,
        role: "assistant",
        content:
          "Great! Let me generate some project ideas based on our conversation...",
        timestamp: new Date(),
      };

      updateState("interviewing", {
        conversationHistory: newHistory,
        currentQuestion: "",
        messages: [...updatedMessages, generatingMessage],
      });

      // Loading will show in chat as thinking indicator
      try {
        const data = await api.generateIdeas({
          interest: sessionState.interest,
          conversation: newHistory,
        });

        // Add small delay before transition for smooth animation
        await new Promise((resolve) => setTimeout(resolve, 500));

        updateState("showOptions", {
          ideaOptions: data.ideas,
          conversationHistory: newHistory,
          messages: [...updatedMessages, generatingMessage],
        });
      } catch (err: any) {
        toast.error("Error", { description: err.message });
        updateState("interviewing", {
          conversationHistory: sessionState.conversationHistory,
          messages: sessionState.messages,
        });
      }
    } else {
      try {
        const data = await api.continueInterview(
          sessionState.interest,
          newHistory
        );

        // Add AI's next question to messages
        const aiMessage: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          role: "assistant",
          content: data.question,
          timestamp: new Date(),
        };

        updateState("interviewing", {
          conversationHistory: newHistory,
          currentQuestion: data.question,
          messages: [...updatedMessages, aiMessage],
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
