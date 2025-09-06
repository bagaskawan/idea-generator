// src/app/(auth)/auth/callback/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url); // Gunakan origin dari request.url
  const code = searchParams.get("code");

  // Jangan gunakan header, gunakan origin dari URL request yang masuk.
  // Ini jauh lebih andal di lingkungan serverless.
  const redirectTo = origin;

  if (!code) {
    return NextResponse.redirect(
      `${redirectTo}/login?error=No authorization code provided`
    );
  }

  const cookieStore = await cookies();

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
    // Redirect kembali ke halaman login di domain yang benar jika ada error
    return NextResponse.redirect(
      `${redirectTo}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // Redirect ke dashboard di domain yang benar
  return NextResponse.redirect(`${redirectTo}/dashboard`);
}
