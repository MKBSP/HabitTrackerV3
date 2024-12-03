import { redirect } from '@sveltejs/kit';

export const load = async ({ url, locals: { safeGetSession } }) => {
    const { session, user } = await safeGetSession();

    // Public routes that don't require authentication
    const publicRoutes = ['/auth/login', '/auth/signup', '/'];
    const isPublicRoute = publicRoutes.includes(url.pathname);

    if (!session && !isPublicRoute) {
        throw redirect(303, '/auth/login');
    }

    if (session && (url.pathname === '/auth/login' || url.pathname === '/auth/signup')) {
        throw redirect(303, '/dashboard');
    }

    return {
        session,
        user
    };
};
