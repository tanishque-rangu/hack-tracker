'use client';

import * as React from "react";
import { Crown, Mail, ExternalLink } from "lucide-react";
import { useAppStore } from "@/lib/store/use-app-store";
import { canViewDeveloperFooter } from "@/lib/auth/auth-service";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

export function DeveloperFooter() {
  const { currentUser, isHydrated } = useAppStore();
  const [videoError, setVideoError] = React.useState(false);

  // Determine visibility using the decoupled authorization helper
  const isVisible = canViewDeveloperFooter(currentUser);

  // If hidden or not hydrated yet, do NOT render the container or load the video asset at all!
  if (!isHydrated || !isVisible) {
    return null;
  }

  // Personalized Callout below the equation tailored for Vyshnavi, Varshini, and Nivedan
  const getPersonalizedQuery = () => {
    if (!currentUser) return null;
    const email = (currentUser.email || "").toLowerCase();
    const name = (currentUser.full_name || "").toLowerCase();

    if (email.includes("vyshnavi") || email.includes("nagavelli") || name.includes("vyshnavi")) {
      return "vaishavi who are you????";
    }
    if (email.includes("varshini") || email.includes("akula") || name.includes("varshini")) {
      return "varshaini who are you????";
    }
    if (email.includes("nivedan") || name.includes("nivedan")) {
      return "nivedam who are you????";
    }
    return "who are you????";
  };

  const personalizedQuery = getPersonalizedQuery();

  return (
    <footer
      className="relative w-full overflow-hidden bg-black text-zinc-100 border-t border-amber-500/40 select-none shadow-2xl font-cinzel"
      aria-label="Developer Credits"
    >
      {/* Background Video with boosted visibility (clear motion, not blacked out) */}
      {!videoError ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoError(true)}
          className="absolute inset-0 w-full h-full object-cover opacity-80 filter contrast-110 pointer-events-none"
        >
          <source src="/ambiance/squad-footer.mp4" type="video/mp4" />
        </video>
      ) : null}

      {/* Lightweight gradient overlay that keeps video vivid while ensuring golden text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 pb-28 md:pb-16 flex flex-col justify-between space-y-8 z-10 font-cinzel">
        {/* Top row: Administration Header and Royal Proclamation */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 pb-8 border-b border-amber-500/25">
          <div className="space-y-3">
            <span className="text-[11px] sm:text-xs tracking-[0.35em] uppercase text-amber-400 font-bold block font-cinzel">
              Administrative by
            </span>

            {/* Administrator name with golden glow in Cinzel Decorative */}
            <div className="text-2xl sm:text-4xl md:text-6xl font-black text-amber-200 tracking-wide drop-shadow-[0_0_25px_rgba(245,158,11,0.65)] flex flex-wrap items-center gap-2.5 sm:gap-3.5 font-cinzel-decorative">
              <span>TANISHQUE RANGU</span>
              <Crown className="h-6 w-6 sm:h-9 sm:w-9 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.85)] shrink-0" />
            </div>

            {/* Custom Proclamation & Mathematical Equation */}
            <div className="space-y-2.5 pt-2 max-w-2xl font-cinzel">
              <p className="text-amber-200 text-sm sm:text-base font-semibold tracking-wider leading-relaxed uppercase">
                &ldquo;Everyone thanks me, because I made this website for you all.&rdquo;
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="font-mono text-base sm:text-xl font-black text-amber-100 tracking-widest drop-shadow-[0_0_12px_rgba(251,191,36,0.45)] px-3.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  e<sup>iπ</sup> + 1 = 0
                </span>
                <span className="text-[11px] sm:text-xs text-amber-400/90 font-medium tracking-[0.2em] uppercase">
                  Euler&apos;s Identity · The God Equation
                </span>
              </div>

              {/* Personalized Callout Below Equation */}
              {personalizedQuery && (
                <div className="pt-2">
                  <p className="text-amber-300 text-sm sm:text-base font-bold tracking-widest uppercase drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                    {personalizedQuery}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-xs bg-black/65 p-4 rounded-xl border border-amber-500/35 backdrop-blur-md shadow-2xl font-cinzel">
            {/* Mail */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold block">
                Mail
              </span>
              <a
                href="mailto:tanishque1959@gmail.com"
                className="text-zinc-200 hover:text-amber-300 flex items-center gap-1.5 transition-colors font-medium tracking-wide"
              >
                <Mail className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>tanishque1959@gmail.com</span>
              </a>
            </div>

            {/* GitHub */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold block">
                GitHub
              </span>
              <a
                href="https://github.com/tanishque-rangu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-200 hover:text-amber-300 flex items-center gap-1.5 transition-colors font-medium tracking-wide"
              >
                <GithubIcon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>tanishque-rangu</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </a>
            </div>

            {/* LinkedIn */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold block">
                LinkedIn
              </span>
              <span className="text-zinc-400 flex items-center gap-1.5 font-medium tracking-wide">
                <LinkedinIcon className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                <span>Coming Soon</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom row: Subtle copyright and system indicator */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 font-cinzel tracking-wider">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-300 font-bold uppercase tracking-widest">HackTrack · Command System</span>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium">
            © 2026 Tanishque Rangu. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
