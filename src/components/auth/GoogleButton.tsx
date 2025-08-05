"use client";
import { cn } from "@/lib/utils";
import { signInWithGoogle } from "@/lib/auth-actions";
import { Loader2 } from "lucide-react";

interface GoogleButtonProps {
  isLoading: boolean;
  onClick: () => void;
  className?: string;
  disabled: boolean;
}

export function GoogleButton({
  isLoading,
  onClick,
  className,
  disabled,
}: GoogleButtonProps) {
  const handleClick = async () => {
    onClick();
    await signInWithGoogle();
  };
  return (
    <button
      onClick={handleClick}
      disabled={isLoading || disabled}
      className={cn(
        "w-full p-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 flex items-center justify-center gap-2",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.04.69-2.37 1.1-3.71 1.1-2.85 0-5.27-1.92-6.13-4.49H2.18v2.82C4 20.36 7.77 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.87 14.01c-.22-.66-.35-1.36-.35-2.01s.13-1.35.35-2.01V7.17H2.18C1.43 8.47 1 9.93 1 11.5s.43 3.03 1.18 4.33l3.69-2.82z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.77 1 4 3.64 2.18 7.17l3.69 2.82C6.73 7.42 9.15 5.38 12 5.38z"
          />
        </svg>
      )}
      <span>{isLoading ? "Signing in..." : "Login with Google"}</span>
    </button>
  );
}
