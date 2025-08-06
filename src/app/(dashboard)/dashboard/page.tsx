"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import useUser from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { signout } from "@/lib/auth-actions";

export default function Dashboard() {
  const { user, loading: isUserLoading, error: userError } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  // Redirect ke halaman login jika user tidak ditemukan setelah loading selesai
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  // Handler untuk proses logout
  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signout();
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="mt-4 text-gray-600">Loading user data...</p>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p>Error: {userError.message}</p>
        <Button onClick={() => router.push("/login")} variant="link">
          Go to Login
        </Button>
      </div>
    );
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Welcome, {displayName}!</h1>
        <p className="mt-2 text-gray-600">You are successfully logged in.</p>
      </div>

      <Button
        onClick={handleSignOut}
        disabled={isLoggingOut}
        variant="outline"
        size="lg"
        className="w-32"
      >
        {isLoggingOut ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          "Logout" // Tampilkan teks biasa
        )}
      </Button>
    </div>
  );
}
