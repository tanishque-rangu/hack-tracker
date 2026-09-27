import { UserRole } from "@/lib/types";

export interface AllowedUserConfig {
  email: string;
  full_name: string;
  role: UserRole;
  footer_visible: boolean;
}

/**
 * Initial authorized team roster and visibility configuration.
 * Email comparisons are strictly case-insensitive.
 */
export const ALLOWED_TEAM_CONFIG: AllowedUserConfig[] = [
  {
    email: "koushikkatkam@gmail.com",
    full_name: "Koushik Katkam",
    role: "admin",
    footer_visible: false,
  },
  {
    email: "pidugushivaram@gmail.com",
    full_name: "Shivaram Pidugu",
    role: "member",
    footer_visible: false,
  },
  {
    email: "tanishque1959@gmail.com",
    full_name: "Tanishque Rangu",
    role: "member",
    footer_visible: false,
  },
  {
    email: "varshiniakula6@gmail.com",
    full_name: "Varshini Akula",
    role: "member",
    footer_visible: true,
  },
  {
    email: "nivedankatkam@gmail.com",
    full_name: "Nivedan Katkam",
    role: "coordinator",
    footer_visible: true,
  },
  {
    email: "nagavellivyshnavi3@gmail.com",
    full_name: "Vyshnavi Nagavelli",
    role: "member",
    footer_visible: true,
  },
  {
    email: "nothingonlyforsaving@gmail.com",
    full_name: "Tester Persona",
    role: "member",
    footer_visible: true,
  },
];

export function isEmailAuthorized(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  // Any valid email can register and sign in with OTP
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

export function getAllowedUserConfig(email: string | null | undefined): AllowedUserConfig | undefined {
  if (!email) return undefined;
  const normalized = email.trim().toLowerCase();
  const found = ALLOWED_TEAM_CONFIG.find((u) => u.email.toLowerCase() === normalized);
  if (found) return found;

  const isKoushik = normalized === 'koushikkatkam@gmail.com';
  return {
    email: normalized,
    full_name: normalized.split('@')[0].replace(/[._-]/g, ' '),
    role: isKoushik ? 'admin' : 'member',
    footer_visible: false,
  };
}
