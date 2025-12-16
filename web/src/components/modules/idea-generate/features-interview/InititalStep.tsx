"use client";

import { FormEvent } from "react";
import { Input } from "@/components/shared/ui/input";
import { Button } from "@/components/shared/ui/button";
import { Lightbulb, Sparkles, Zap } from "lucide-react";

interface InitialStepProps {
  handleStart: (interest: string) => void;
  isLoading: boolean;
  defaultInterest: string;
}

export const InitialStep = ({
  handleStart,
  isLoading,
  defaultInterest,
}: InitialStepProps) => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const interest = (
      e.currentTarget.elements.namedItem("interest") as HTMLInputElement
    ).value;
    handleStart(interest);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4 animate-in fade-in-50 text-center pb-24">
      <div className="max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-18">
          Get the <Zap className="inline-block w-10 h-10 text-primary -mt-2" />
          Application You <br /> Want for Growth{" "}
        </h1>
        <form onSubmit={handleSubmit} className="relative w-full mx-auto">
          <Input
            name="interest"
            defaultValue={defaultInterest}
            placeholder="Make a Travel App"
            className="h-14 px-6 text-lg rounded-full border-2 pr-16"
            disabled={isLoading}
            autoFocus
          />
          <Button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full"
            disabled={isLoading}
            aria-label="Start Interview"
          >
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </Button>
        </form>
      </div>
    </div>
  );
};
