
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
    // Wait for layout data (which includes session)
    const { session } = await parent();
    
    return {
        session
    };
};