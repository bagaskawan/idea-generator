"use client";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { GithubButton } from "@/components/auth/GithubButton";

import Image from "next/image";
import { signInWithGoogle, signInWithGithub } from "@/lib/auth-actions";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";


export default function LoginPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setIsGoogleLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsGithubLoading(true);
    try {
      await signInWithGithub();
    } catch (error) {
      console.error("GitHub sign-in failed:", error);
      setIsGithubLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row">
      {/* Left Side - Illustration */}
      <div className="relative hidden w-3/4 lg:block">
        <Image
          src="/login.png"
          alt="Illustration of a person analyzing charts on a screen"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 0vw, 75vw"
        />
      </div>
      {/* Right Side - Login Form */}
      <div className="flex w-full items-center justify-center bg-background p-8 lg:w-1/4">
        <Card className="w-full max-w-md border-0 shadow-none">
          <CardContent className="px-0 space-y-8">
            {/* Header Text */}
            <div className="space-y-4">
              <h1
                className={cn(
                  "text-4xl font-extrabold leading-[1.2] text-foreground"
                )}
              >
                Move from a spark of inspiration to a full project{" "}
                <span className="text-primary">BLUEPRINT</span> in{" "}
                <span className="text-destructive">just minute</span>.
              </h1>
            </div>

            {/* Sign in Buttons */}
            <div className="space-y-4 pt-4">
              <GoogleButton
                isLoading={isGoogleLoading}
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isGithubLoading}
                className="w-full h-14 bg-background border-2 border-border text-foreground hover:bg-accent hover:border-primary transition-all duration-200 text-base font-medium"
              />
              <GithubButton
                isLoading={isGithubLoading}
                onClick={handleGithubSignIn}
                disabled={isGoogleLoading || isGithubLoading}
                className="w-full h-14 border-2 border-border text-foreground hover:bg-accent hover:border-primary transition-all duration-200 text-base font-medium"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
