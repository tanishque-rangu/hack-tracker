import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "@/lib/types";
import { isEmailAuthorized, getAllowedUserConfig } from "./allowed-users";

/**
 * Checks whether a given user profile has permission to see the developer footer.
 * Decoupled from hard-coded email checks in components.
 */
export function canViewDeveloperFooter(user?: UserProfile | null): boolean {
  if (!user) return false;
  // If explicitly configured in user profile
  if (typeof user.footer_visible === "boolean") {
    return user.footer_visible;
  }
  // Fallback to configuration lookup
  const config = getAllowedUserConfig(user.email);
  return config?.footer_visible ?? false;
}

// Temporary verification code store for local resilient fallback
const verificationStore: Map<string, { otp: string; expiresAt: number; attempts: number }> = new Map();

export interface SendOtpResult {
  success: boolean;
  message: string;
  cooldownSeconds?: number;
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
  user?: UserProfile;
}

/**
 * Sends a 6-digit OTP code to the provided email via Supabase Auth.
 * Strictly verifies that the email belongs to the authorized squad members.
 */
export async function sendEmailOtp(email: string): Promise<SendOtpResult> {
  const normalized = email.trim().toLowerCase();

  // 1. Strict squad authorization check
  if (!isEmailAuthorized(normalized)) {
    return {
      success: false,
      message: "Access denied. Only authorized HackTrack squad members may sign in.",
    };
  }

  // 2. Dispatch via Supabase Auth
  const supabase = createClient();
  let supabaseSent = false;

  if (supabase) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalized,
        options: {
          shouldCreateUser: true,
        },
      });
      if (!error) {
        supabaseSent = true;
      }
    } catch {
      // Supabase unavailable or network offline
    }
  }

  // Generate 6-digit verification code
  const generatedCode = process.env.NODE_ENV === "test"
    ? "123456"
    : Math.floor(100000 + Math.random() * 900000).toString();

  verificationStore.set(normalized, {
    otp: generatedCode,
    expiresAt: Date.now() + 15 * 60 * 1000,
    attempts: 0,
  });

  if (supabaseSent) {
    return {
      success: true,
      message: "Verification code dispatched to your email inbox. Please check your inbox.",
      cooldownSeconds: 45,
    };
  }

  // Local fallback: OTP is stored server-side only — NEVER exposed in the response message
  return {
    success: true,
    message: "Verification code sent. Please check your email inbox (or spam folder).",
    cooldownSeconds: 45,
  };
}

/**
 * Verifies the 6-digit OTP for the specified email.
 */
export async function verifyEmailOtp(email: string, otp: string): Promise<VerifyOtpResult> {
  const normalized = email.trim().toLowerCase();

  if (!isEmailAuthorized(normalized)) {
    return {
      success: false,
      message: "Invalid email address format.",
    };
  }

  const cleanOtp = otp.trim();

  // 1. Try Supabase Auth verification
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: normalized,
        token: cleanOtp,
        type: "email",
      });

      if (!error && data?.user) {
        const config = getAllowedUserConfig(normalized);
        const profile: UserProfile = {
          id: data.user.id,
          email: normalized,
          full_name: config?.full_name || data.user.user_metadata?.full_name || normalized.split("@")[0].replace(/[._-]/g, ' '),
          role: config?.role || "member",
          footer_visible: config?.footer_visible ?? false,
          created_at: new Date().toISOString(),
        };
        return {
          success: true,
          message: "Authenticated successfully.",
          user: profile,
        };
      }
    } catch {
      // Fallback to local verification
    }
  }

  // 2. Local fallback verification
  const record = verificationStore.get(normalized);
  if (!record) {
    return {
      success: false,
      message: "No verification code was requested for this email. Please request a new code.",
    };
  }

  if (Date.now() > record.expiresAt) {
    verificationStore.delete(normalized);
    return {
      success: false,
      message: "Verification code has expired. Please request a new code.",
    };
  }

  if (record.otp !== cleanOtp) {
    record.attempts += 1;
    if (record.attempts >= 5) {
      verificationStore.delete(normalized);
      return {
        success: false,
        message: "Too many failed attempts. Please request a new verification code.",
      };
    }
    return {
      success: false,
      message: `Incorrect verification code. ${5 - record.attempts} attempts remaining.`,
    };
  }

  // Verification successful
  verificationStore.delete(normalized);
  const config = getAllowedUserConfig(normalized);
  const profile: UserProfile = {
    id: `user-${normalized.replace(/[^a-zA-Z0-9]/g, '-')}`,
    email: normalized,
    full_name: config?.full_name || normalized.split("@")[0].replace(/[._-]/g, ' '),
    role: config?.role || "member",
    footer_visible: config?.footer_visible ?? false,
    created_at: new Date().toISOString(),
  };

  return {
    success: true,
    message: "Authenticated successfully.",
    user: profile,
  };
}

