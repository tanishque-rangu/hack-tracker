'use client';

import * as React from "react";
import { OtpAuthCard } from "../login/page";

export default function SignupPage() {
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
