// @ts-nocheck

import type { PageLoad } from './$types';

export const load = async ({ parent }: Parameters<PageLoad>[0]) => {
    // Wait for layout data (which includes session)
    const { session } = await parent();
    
    return {
        session
    };
};