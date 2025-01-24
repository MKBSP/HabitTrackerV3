
import { supabase } from '$lib/supabase';

export async function getUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data: profile } = await supabase
        .from('Profiles')
        .select('id')
        .eq('user_auth_id', user.id)
        .single();

    if (!profile) throw new Error('No profile found');
    return { user, profile };
}