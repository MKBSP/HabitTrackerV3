import { writable, type Writable } from 'svelte/store';
import type { Session, User } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const session: Writable<Session | null> = writable(null);
export const user: Writable<User | null> = writable(null);

// Create browser client for client-side operations
const supabase = createBrowserClient(
    PUBLIC_SUPABASE_URL, 
    PUBLIC_SUPABASE_ANON_KEY,
);

export function initAuth() {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            session.set(currentSession);
            user.set(currentSession?.user ?? null);
        }
        if (event === 'SIGNED_OUT') {
            session.set(null);
            user.set(null);
        }
    });

    return subscription;
}

export async function getSession(): Promise<Session | null> {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession) {
        session.set(currentSession);
        user.set(currentSession.user);
    }
    return currentSession;
}

export async function checkAndRefreshSession(): Promise<boolean> {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession) return false;
    
    if (new Date(currentSession.expires_at * 1000) < new Date()) {
        const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
        if (error || !newSession) return false;
        
        session.set(newSession);
        user.set(newSession.user);
    }
    return true;
}