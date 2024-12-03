import { error } from "@sveltejs/kit";

export const getOrCreateUserProfile = async (locals: App.Locals) => {
    const { user } = await locals.safeGetSession();

    if (!user) {
        return null;
    }

    const { data: profile, error: profileError } = await locals.supabase
        .from('Profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profile) {
        return profile;
    }

    // If profile doesn't exist, create it
    const { data: newProfile, error: insertError } = await locals.supabase
        .from('Profiles')
        .insert([
            {
                id: user.id,
                email: user.email,
                user_auth_id: user.id,
                is_active: true
            }
        ])
        .select()
        .single();

    if (insertError) {
        throw error(500, "Could not create profile");
    }

    return newProfile;
};
