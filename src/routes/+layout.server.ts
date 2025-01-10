import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
    const session = await locals.getSession();
    const isProtectedRoute = url.pathname.startsWith('/dashboard') || 
                            url.pathname.startsWith('/goals');

    if (isProtectedRoute && !session) {
        throw redirect(303, '/auth/login');
    }

    return { session };
};