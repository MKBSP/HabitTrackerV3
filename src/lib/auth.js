
import { supabase } from './supabaseClient';

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  return data.user;
}

// ...existing code...