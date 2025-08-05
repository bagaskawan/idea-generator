// src/app/(auth)/auth/callback/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // Dynamically build the redirect URL
  const redirectTo = request.headers.get("origin") || "http://localhost:3000";

  if (!code) {
    return NextResponse.redirect(
      `${redirectTo}/login?error=No authorization code provided`
    );
  }

  // 1️⃣ Await cookies() once
  const cookieStore = await cookies();

  // 2️⃣ Pass the resolved object to createServerClient
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${redirectTo}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${redirectTo}/dashboard`);
}
