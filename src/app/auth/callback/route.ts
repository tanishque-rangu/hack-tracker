import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isEmailAuthorized } from "@/lib/auth/allowed-users";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const cookieStore = await cookies();
  const response = NextResponse.redirect(`${origin}${redirect}`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://omzcycyutoswlmbqyasj.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_RKAdX8Y1q2xGRSPg4FTIXg_eG4kMDXy";

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Exchange the OAuth code for a session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("OAuth callback error:", error?.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Accept any user email or fallback to metadata / user ID
  const userEmail =
    data.user.email ||
    data.user.user_metadata?.email ||
    (data.user.user_metadata?.user_name
      ? `${data.user.user_metadata.user_name}@github.user`
      : `user-${data.user.id.slice(0, 8)}@hacktrack.app`);

  // Set session cookie for middleware
  response.cookies.set("squadsync_session", userEmail, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
    httpOnly: false,
  });

  return response;
}

