// This file defines the shape of our Profile data
// It matches our Supabase database structure
export type Profile = {
    id: string;                    // Unique identifier for the profile
    created_at: string;            // When the profile was created
    user_name: string | null;      // Username (optional)
    profile_picture: string | null; // URL to profile picture (optional)
    location: string | null;       // User's location (optional)
    is_active: boolean;            // Whether the profile is active
    description: string | null;    // User's bio/description (optional)
    user_auth_id: string;          // Links to Supabase auth user
    email: string;                 // User's email
    pokemon_ids: number[] | null;  // Array of Pokemon IDs (optional)
};