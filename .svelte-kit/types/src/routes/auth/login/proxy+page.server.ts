// @ts-nocheck
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

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

            return { success: true, message: 'Check your email to confirm your account' };
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