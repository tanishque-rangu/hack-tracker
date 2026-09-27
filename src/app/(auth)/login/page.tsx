'use client';

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  ArrowRight,
  Shield,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/use-app-store";
import { getAllowedUserConfig } from "@/lib/auth/allowed-users";
import { sendEmailOtp, verifyEmailOtp } from "@/lib/auth/auth-service";

export function OtpAuthCard({ onAuthenticated }: { onAuthenticated?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get("redirect") || "/";

  const { switchUser, users, addUser } = useAppStore();

  // Form inputs
  const [email, setEmail] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [isNewUser, setIsNewUser] = React.useState(false);

  // OTP flow state
  const [otpStep, setOtpStep] = React.useState<"email" | "code">("email");
  const [otpDigits, setOtpDigits] = React.useState<string[]>(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = React.useState(0);
  const otpInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // UI state
  const [loading, setLoading] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Cooldown countdown
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Complete authenticated session setup
  const establishSession = (userEmail: string, userFullName?: string) => {
    const normalized = userEmail.trim().toLowerCase();
    const config = getAllowedUserConfig(normalized);

    // Set middleware session cookie
    document.cookie = `squadsync_session=${encodeURIComponent(normalized)}; path=/; max-age=604800; SameSite=Lax`;

    // Sync in-memory store
    const existing = users.find((u) => u.email.toLowerCase() === normalized);
    if (existing) {
      switchUser(existing.id);
    } else {
      const added = addUser({
        full_name: userFullName || fullName.trim() || config?.full_name || normalized.split("@")[0],
        email: normalized,
        role: config?.role || "member",
        footer_visible: config?.footer_visible ?? false,
      });
      switchUser(added.id);
    }

    if (onAuthenticated) {
      onAuthenticated();
    } else {
      setTimeout(() => {
        router.push(redirectTarget);
      }, 400);
    }
  };

  // SEND OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setStatusMessage({ type: "error", text: "Please enter your email address." });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setStatusMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    // Check if new user
    const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!existing) {
      setIsNewUser(true);
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await sendEmailOtp(normalizedEmail);
      if (!res.success) {
        setStatusMessage({ type: "error", text: res.message });
        setLoading(false);
        return;
      }

      setOtpStep("code");
      setCooldown(res.cooldownSeconds || 45);
      setStatusMessage({
        type: "info",
        text: res.message,
      });

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to dispatch verification code." });
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");

    if (fullOtp.length < 6) {
      setStatusMessage({ type: "error", text: "Please enter the complete 6-digit verification code." });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await verifyEmailOtp(email, fullOtp);
      if (!res.success || !res.user) {
        setStatusMessage({ type: "error", text: res.message });
        setLoading(false);
        return;
      }

      setStatusMessage({ type: "success", text: "Verified successfully! Accessing HackTrack..." });
      establishSession(res.user.email, fullName.trim() || res.user.full_name);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to verify OTP." });
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const digit = val.slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim().replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasted) return;
    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || "";
    }
    setOtpDigits(updated);
    const nextIndex = Math.min(pasted.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  return (
    <Card className="p-6 sm:p-8 bg-[#131317]/95 border-white/10 shadow-2xl shadow-black/90 space-y-5 rounded-3xl max-w-md w-full backdrop-blur-xl">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 font-mono">
          HT
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">HackTrack</h1>
        <p className="text-xs text-zinc-400">Enter your email to receive an instant One-Time Password</p>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 animate-in fade-in-0 ${
            statusMessage.type === "error"
              ? "bg-rose-950/40 text-rose-300 border-rose-500/30"
              : statusMessage.type === "success"
              ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
              : "bg-blue-950/40 text-blue-300 border-blue-500/30"
          }`}
        >
          {statusMessage.type === "error" ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          ) : statusMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <KeyRound className="h-4 w-4 shrink-0 text-blue-400" />
          )}
          <span className="leading-snug flex-1">{statusMessage.text}</span>
        </div>
      )}

      {/* STEP 1: EMAIL INPUT */}
      {otpStep === "email" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="otp-email" className="block text-xs font-semibold text-zinc-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
              <input
                id="otp-email"
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-white/10 bg-zinc-900/90 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading || !email.trim()}
            className="w-full h-11 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            {loading ? "Sending One-Time Password..." : "Send Verification Code"}
          </Button>
        </form>
      ) : (
        /* STEP 2: 6-DIGIT CODE INPUT */
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="text-center space-y-1">
            <span className="text-xs font-medium text-zinc-300 block">
              Enter the 6-digit verification code sent to
            </span>
            <p className="text-xs font-mono font-semibold text-blue-400 truncate">{email}</p>
          </div>

          {isNewUser && (
            <div className="space-y-1.5 pt-1">
              <label htmlFor="user-full-name" className="block text-xs font-medium text-zinc-300">
                Your Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  id="user-full-name"
                  type="text"
                  placeholder="Enter your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-white/10 bg-zinc-900/90 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 max-w-[300px] mx-auto py-2">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  otpInputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                onPaste={idx === 0 ? handleOtpPaste : undefined}
                className="h-12 w-11 text-center text-lg font-mono font-bold rounded-xl border border-white/15 bg-zinc-900/90 text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading || otpDigits.join("").length < 6}
            className="w-full h-11 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            {loading ? "Verifying..." : "Verify & Sign In"}
          </Button>

          <div className="pt-2 flex items-center justify-between text-xs text-zinc-400 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                setOtpStep("email");
                setOtpDigits(["", "", "", "", "", ""]);
                setStatusMessage(null);
              }}
              className="hover:text-zinc-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Change email</span>
            </button>
            <button
              type="button"
              disabled={cooldown > 0 || loading}
              onClick={() => handleSendOtp()}
              className={`flex items-center gap-1 transition-colors cursor-pointer ${
                cooldown > 0 ? "text-zinc-600 cursor-not-allowed" : "text-blue-400 hover:text-blue-300"
              }`}
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              <span>{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Security note */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
        <Shield className="h-3.5 w-3.5 text-blue-400 shrink-0" />
        <span>One-Time Password · No passwords stored</span>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-500 font-mono text-xs">
          Loading Security Portal...
        </div>
      }
    >
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-4">
        <OtpAuthCard />
      </div>
    </React.Suspense>
  );
}
