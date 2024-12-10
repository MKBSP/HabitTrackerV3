import { redirect } from '@sveltejs/kit';

const PUBLIC_ROUTES = new Set(['/auth/login', '/auth/signup', '/']);

export const load = async ({ url, locals: { safeGetSession } }) => {
    const { session, user } = await safeGetSession();
    const isPublicRoute = PUBLIC_ROUTES.has(url.pathname);

    if (!session && !isPublicRoute) {
        throw redirect(303, '/auth/login');
    }

    if (session && (url.pathname === '/auth/login' || url.pathname === '/auth/signup')) {
        throw redirect(303, '/dashboard');
    }

    return { session, user };
};
