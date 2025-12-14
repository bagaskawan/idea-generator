"use client";

import { ChatContainer } from "@/components/shared/ui/ChatContainer";
import { ChatInput } from "@/components/shared/ui/ChatInput";
import { ChatMessage } from "@/components/shared/ui/ChatMessage";
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

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">AI</span>
            </div>
            <div>
              <h2 className="font-semibold text-foreground">AI Architect</h2>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Thinking..." : "Online"}
              </p>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            {step}/{totalSteps}
          </span>
        </div>
      </div>

      {/* Messages Container */}
      <ChatContainer className="flex-1 py-6">
        {sessionState.messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
          />
        ))}

        {/* Thinking indicator */}
        {isLoading && (
          <ChatMessage
            role="assistant"
            content=""
            timestamp={new Date()}
            isThinking={true}
          />
        )}
      </ChatContainer>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-border px-6 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ChatInput
          value={currentAnswer}
          onChange={setCurrentAnswer}
          onSubmit={handleContinue}
          disabled={isLoading}
          placeholder={isLoading ? "AI is thinking..." : "Type your answer..."}
          centered={false}
          autoFocus={false}
        />
      </div>
    </div>
  );
};
