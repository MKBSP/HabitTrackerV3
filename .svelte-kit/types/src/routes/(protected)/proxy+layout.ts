// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load = async ({ parent }: Parameters<LayoutLoad>[0]) => {
    const { session } = await parent();
    
    if (!session) {
        throw redirect(303, '/auth/login');
    }

    return {
        session
    };
};