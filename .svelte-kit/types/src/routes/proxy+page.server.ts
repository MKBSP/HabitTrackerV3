// @ts-nocheck
import { error, fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from './$types';

export const load = async ({ locals: { supabase } }: Parameters<PageServerLoad>[0]) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
        return { user: null };
    }

    const { data: profile, error: profileError } = await supabase
        .from('Profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (profileError && profileError.code !== 'PGRST116') {
        throw error(500, "Error fetching profile");
    }

    return { user: session.user, profile };
};

export const actions = {
    default: async ({ request, locals: { supabase } }: import('./$types').RequestEvent) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const isSignUp = formData.get('isSignUp') === 'true';

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                return fail(400, { error: error.message });
            }

            return { success: true };
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return fail(400, { error: error.message });
            }

            throw redirect(303, '/dashboard');
        }
    }
};
;null as any as Actions;