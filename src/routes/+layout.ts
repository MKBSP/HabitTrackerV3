import { createBrowserClient } from "@supabase/ssr";
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ depends }) => {
    depends("supabase:auth");

    const supabase = createBrowserClient(
        PUBLIC_SUPABASE_URL,
        PUBLIC_SUPABASE_ANON_KEY
    );

    // Get authenticated user data securely
    const { data: { session } } = await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();

    return {
        supabase,
        session,
        user
    };
};
