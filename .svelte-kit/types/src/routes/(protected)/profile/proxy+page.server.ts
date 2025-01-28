// @ts-nocheck
// This file handles server-side logic for the profile page
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

// Load function - runs when page is loaded
export const load = async ({ locals: { supabase } }: Parameters<PageServerLoad>[0]) => {
    // Get authenticated user instead of session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!user || userError) {
        throw error(401, 'Unauthorized');
    }

    // Fetch the user's profile from Supabase
    const { data: profile, error: profileError } = await supabase
        .from('Profiles')
        .select('*')
        .eq('user_auth_id', user.id)
        .single();

    if (profileError) {
        throw error(500, 'Error fetching profile');
    }

    return { profile, user }; // Return user instead of session
};

// Handle form submissions
export const actions = {
    updateProfile: async ({ request, locals: { supabase, getSession } }: import('./$types').RequestEvent) => {
        const session = await getSession();
        if (!session) return fail(401, { error: 'Unauthorized' });

        const formData = await request.formData();
        
        const { error: updateError } = await supabase
            .from('Profiles')
            .update({
                user_name: formData.get('userName'),
                location: formData.get('location'),
                description: formData.get('description')
            })
            .eq('user_auth_id', session.user.id);

        if (updateError) return fail(500, { error: updateError.message });
        return { success: true };
    },

    updateEmail: async ({ request, locals: { supabase, getSession } }: import('./$types').RequestEvent) => {
        const session = await getSession();
        if (!session) return fail(401, { error: 'Unauthorized' });

        const formData = await request.formData();
        const newEmail = formData.get('email') as string;

        const { error: updateError } = await supabase.auth.updateUser({
            email: newEmail
        });

        if (updateError) return fail(500, { error: updateError.message });
        return { success: true, message: 'Verification email sent' };
    },

    updatePassword: async ({ request, locals: { supabase, getSession } }: import('./$types').RequestEvent) => {
        const session = await getSession();
        if (!session) return fail(401, { error: 'Unauthorized' });

        const formData = await request.formData();
        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (newPassword !== confirmPassword) {
            return fail(400, { error: 'Passwords do not match' });
        }

        // Verify current password
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: session.user.email!,
            password: currentPassword
        });

        if (signInError) return fail(400, { error: 'Current password is incorrect' });

        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) return fail(500, { error: updateError.message });
        return { success: true };
    },

    deleteProfile: async ({ request, locals: { supabase, getSession } }: import('./$types').RequestEvent) => {
        const session = await getSession();
        if (!session) return fail(401, { error: 'Unauthorized' });

        const formData = await request.formData();
        const confirmation = formData.get('deleteConfirmation');

        if (confirmation !== 'delete me') {
            return fail(400, { error: 'Invalid confirmation text' });
        }

        // Mark profile as inactive instead of deleting
        const { error: updateError } = await supabase
            .from('Profiles')
            .update({
                is_active: false
            })
            .eq('user_auth_id', session.user.id);

        if (updateError) return fail(500, { error: updateError.message });

        // Sign out the user
        await supabase.auth.signOut();
        throw redirect(303, '/auth/login');
    }
};;null as any as Actions;