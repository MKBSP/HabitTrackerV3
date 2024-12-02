import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('Profiles')  // Changed from 'profiles' to 'Profiles'
            .select('*')
            .limit(1);

        if (error) {
            return json({ success: false, error: error.message }, { status: 500 });
        }

        return json({ success: true, data });
    } catch (e) {
        return json({ success: false, error: 'Failed to connect to Supabase' }, { status: 500 });
    }
}