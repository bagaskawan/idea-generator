"use client";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { GithubButton } from "@/components/auth/GithubButton";
import { Inter } from "next/font/google";
import Image from "next/image";
import { signInWithGoogle, signInWithGithub } from "@/lib/auth-actions";
import { useState } from "react";
const inter = Inter({
  weight: ["700", "800"],
  subsets: ["latin"],
});

export default function LoginPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

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
      <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/4">
        <Card className="w-full max-w-md border-0 shadow-none">
          <CardContent className="px-0 space-y-8">
            {/* Header Text */}
            <div className="space-y-4">
              <h1
                className={cn(
                  "text-5xl font-extrabold leading-[1.2] text-[#393E46]",
                  inter.className
                )}
              >
                Move from a spark of inspiration to a full project{" "}
                <span className="text-[#3D74B6]">BLUEPRINT</span> in{" "}
                <span className="text-[#722323]">just minute</span>.
              </h1>
            </div>

            {/* Sign in Buttons */}
            <div className="space-y-4 pt-4">
              <GoogleButton
                isLoading={isGoogleLoading}
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isGithubLoading}
                className="w-full h-14 bg-white border-2 border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-base font-medium"
              />
              <GithubButton
                isLoading={isGithubLoading}
                onClick={handleGithubSignIn}
                disabled={isGoogleLoading || isGithubLoading}
                className="w-full h-14 border-2 border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-base font-medium"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
