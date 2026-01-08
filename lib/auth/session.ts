// lib/auth/session.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Session, User } from '@supabase/supabase-js';

/**
 * Server-side session helper for API routes
 * Throws error if no valid session exists
 */
export async function getSession(): Promise<{ session: Session; user: User; supabase: ReturnType<typeof createServerClient> }> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error('Unauthorized', { cause: { status: 401, code: 'AUTHENTICATION_REQUIRED' } });
  }

  return { session, user: session.user, supabase };
}

/**
 * Optional session helper - returns null if no session exists
 * Use for routes that work with or without authentication (e.g., generate endpoint)
 */
export async function getOptionalSession(): Promise<{ session: Session; user: User; supabase: ReturnType<typeof createServerClient> } | null> {
  try {
    return await getSession();
  } catch {
    return null;
  }
}

/**
 * Check if request is from authenticated user
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getOptionalSession();
  return session !== null;
}
