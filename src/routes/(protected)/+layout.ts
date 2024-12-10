import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
    const { session, supabase } = await parent();
    
    if (!session) {
        throw redirect(303, '/auth/login');
    }

    // Make supabase client available to all protected routes
    return {
        session,
        supabase
    };
};