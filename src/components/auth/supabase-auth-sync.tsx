'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store/use-app-store';
import { getAllowedUserConfig, isEmailAuthorized } from '@/lib/auth/allowed-users';

export function SupabaseAuthSync() {
  const { users, switchUser, addUser, logout } = useAppStore();

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
      if (session?.user?.email) {
        const email = session.user.email.toLowerCase();
        if (isEmailAuthorized(email)) {
          const metaName = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
          const config = getAllowedUserConfig(email);
          const existing = users.find((u) => u.email.toLowerCase() === email);
          if (existing) {
            switchUser(existing.id);
          } else if (config) {
            const added = addUser({
              full_name: config.full_name || metaName || email.split("@")[0],
              email: config.email,
              role: config.role,
              footer_visible: config.footer_visible,
            });
            switchUser(added.id);
          }
          // Set session cookie for middleware route protection
          document.cookie = `squadsync_session=${encodeURIComponent(email)}; path=/; max-age=604800; SameSite=Lax`;
          return;
        }
      }

      // No active Supabase session or unauthorized email:
      // Strictly purge any stale cookies and unauthenticate state.
      logout();
    });

    // 2. Listen to real-time Supabase Auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        const email = session.user.email.toLowerCase();
        if (isEmailAuthorized(email)) {
          const metaName = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
          const config = getAllowedUserConfig(email);
          const existing = users.find((u) => u.email.toLowerCase() === email);
          if (existing) {
            switchUser(existing.id);
          } else if (config) {
            const added = addUser({
              full_name: config.full_name || metaName || email.split("@")[0],
              email: config.email,
              role: config.role,
              footer_visible: config.footer_visible,
            });
            switchUser(added.id);
          }
          document.cookie = `squadsync_session=${encodeURIComponent(email)}; path=/; max-age=604800; SameSite=Lax`;
        }
      } else if (event === 'SIGNED_OUT' || !session) {
        logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [users, switchUser, addUser, logout]);

  return null;
}
