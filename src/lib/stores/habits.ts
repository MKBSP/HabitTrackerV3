import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { supabase } from '$lib/supabase';
import { fetchHabitsWithStatus } from '$lib/data/habitService';

type HabitState = {
    habits: TransformedHabit[];
    loading: boolean;
    error: string | null;
    currentDate: string;
    initialized: boolean;
};

function createHabitStore() {
    const initialState: HabitState = {
        habits: [],
        loading: false,
        error: null,
        currentDate: new Date().toISOString(),
        initialized: false
    };

    const { subscribe, set, update } = writable<HabitState>(initialState);

    return {
        subscribe,
        habits: derived({ subscribe }, $state => $state.habits),
        currentDate: derived({ subscribe }, $state => $state.currentDate),
        initialized: derived({ subscribe }, $state => $state.initialized),
        loading: derived({ subscribe }, $state => $state.loading),

        async initialize() {
            if (!browser) return false;
            
            try {
                update(s => ({ ...s, loading: true, error: null }));

                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('No authenticated user');

                const { data: profile } = await supabase
                    .from('Profiles')
                    .select('id')
                    .eq('user_auth_id', user.id)
                    .single();
                
                if (!profile) throw new Error('No profile found');

                const currentDate = new Date().toISOString();
                const habits = await fetchHabitsWithStatus(profile.id, currentDate);
                console.log('=== Habits Before Store Update ===', habits);

                update(s => ({
                    ...s,
                    habits,
                    currentDate,
                    loading: false,
                    initialized: true
                }));

                return true;
            } catch (e) {
                console.error('[HabitStore] Error:', e);
                update(s => ({ 
                    ...s, 
                    error: e.message, 
                    loading: false,
                    initialized: false 
                }));
                return false;
            }
        },

        async setCurrentDate(date: string) {
            try {
                update(s => ({ ...s, loading: true }));
                const { data: { user } } = await supabase.auth.getUser();
                const habits = await fetchHabitsWithStatus(user.id, date);
                update(s => ({ 
                    ...s, 
                    currentDate: date,
                    habits,
                    loading: false
                }));
            } catch (e) {
                console.error('[HabitStore] Error:', e);
                update(s => ({ ...s, error: e.message, loading: false }));
            }
        }

        // ... other methods (toggleComplete, deleteHabit) remain similar
    };
}

export const habitStore = createHabitStore();