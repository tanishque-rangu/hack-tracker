'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store/use-app-store';
import { getAllowedUserConfig, isEmailAuthorized } from '@/lib/auth/allowed-users';

export function SupabaseAuthSync() {
  const { users, switchUser, addUser, updateUser, logout } = useAppStore();

  React.useEffect(() => {
    // Purge legacy storage keys from earlier mock/test iterations
    try {
      localStorage.removeItem('squadsync_storage_v1');
      localStorage.removeItem('squadsync_storage_v2');
      localStorage.removeItem('hacktrack_live_store_v3');
    } catch {
      // ignore
    }

    const supabase = createClient();
    if (!supabase) return;

    // 1. Check initial real Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user;
      if (user) {
        const rawEmail =
          user.email ||
          user.user_metadata?.email ||
          (user.user_metadata?.user_name
            ? `${user.user_metadata.user_name}@github.user`
            : "");
        const email = rawEmail.toLowerCase();

        // STRICT ACCESS RESTRICTION: Block unauthorized emails immediately
        if (!email || !isEmailAuthorized(email)) {
          supabase.auth.signOut();
          logout();
          document.cookie = "squadsync_session=; path=/; max-age=0";
          if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.href = `/login?error=unauthorized&email=${encodeURIComponent(email || "account")}`;
          }
          return;
        }

        const metaName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.user_name;
        const config = getAllowedUserConfig(email);
        const existing = users.find((u) => u.email.toLowerCase() === email);
        if (existing) {
          if (config && (existing.role !== config.role || existing.footer_visible !== config.footer_visible)) {
            updateUser(existing.id, {
              role: config.role,
              footer_visible: config.footer_visible,
            });
          }
          switchUser(existing.id);
        } else {
          const added = addUser({
            full_name: config?.full_name || metaName || email.split("@")[0].replace(/[._-]/g, " "),
            email: email,
            role: config?.role || "member",
            footer_visible: config?.footer_visible ?? false,
          });
          switchUser(added.id);
        }
        // Set session cookie for middleware route protection
        document.cookie = `squadsync_session=${encodeURIComponent(email)}; path=/; max-age=604800; SameSite=Lax`;
        return;
      }

      // No active Supabase session
      logout();
    });

    // 2. Listen to real-time Supabase Auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user;
      if (event === 'SIGNED_IN' && user) {
        const rawEmail =
          user.email ||
          user.user_metadata?.email ||
          (user.user_metadata?.user_name
            ? `${user.user_metadata.user_name}@github.user`
            : "");
        const email = rawEmail.toLowerCase();

        // STRICT ACCESS RESTRICTION: Block unauthorized emails immediately
        if (!email || !isEmailAuthorized(email)) {
          supabase.auth.signOut();
          logout();
          document.cookie = "squadsync_session=; path=/; max-age=0";
          if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.href = `/login?error=unauthorized&email=${encodeURIComponent(email || "account")}`;
          }
          return;
        }

        const metaName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.user_name;
        const config = getAllowedUserConfig(email);
        const existing = users.find((u) => u.email.toLowerCase() === email);
        if (existing) {
          if (config && (existing.role !== config.role || existing.footer_visible !== config.footer_visible)) {
            updateUser(existing.id, {
              role: config.role,
              footer_visible: config.footer_visible,
            });
          }
          switchUser(existing.id);
        } else {
          const added = addUser({
            full_name: config?.full_name || metaName || email.split("@")[0].replace(/[._-]/g, " "),
            email: email,
            role: config?.role || "member",
            footer_visible: config?.footer_visible ?? false,
          });
          switchUser(added.id);
        }
        document.cookie = `squadsync_session=${encodeURIComponent(email)}; path=/; max-age=604800; SameSite=Lax`;
      } else if (event === 'SIGNED_OUT' || !session) {
        logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [users, switchUser, addUser, updateUser, logout]);

  return null;
}
