import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { supabase } from '$lib/supabase';
import { fetchHabitsWithStatus, saveHabitCompletion, type TransformedHabit } from '$lib/data/habitService';

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
    
    const store = {
        subscribe,
        habits: derived({ subscribe }, $state => $state.habits),
        currentDate: derived({ subscribe }, $state => $state.currentDate),
        initialized: derived({ subscribe }, $state => $state.initialized),
        loading: derived({ subscribe }, $state => $state.loading),
        error: derived({ subscribe }, $state => $state.error),

        async initialize() {
            if (!browser) return false;
            
            try {
                update(s => ({ ...s, loading: true, error: null }));

                // Use getUser instead of getSession
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError || !user) throw new Error('No authenticated user');

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

        async setCurrentDate(date: string, showLoading = true) {
            try {
                if (showLoading) {
                    update(s => ({ ...s, loading: true }));
                }
                
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
        },

        async toggleComplete(habitId: number, completed: boolean) {
            try {
                let currentState: string;
                
                // Optimistically update UI immediately
                update(s => {
                    currentState = s.currentDate;
                    return {
                        ...s,
                        habits: s.habits.map(h => 
                            h.id === habitId ? { ...h, isCompleted: completed } : h
                        )
                    };
                });

                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('No authenticated user');

                await saveHabitCompletion(habitId, completed, currentState);
                
            } catch (e) {
                console.error('[HabitStore] Error:', e);
                // Revert the optimistic update on error
                update(s => ({
                    ...s,
                    error: e.message,
                    habits: s.habits.map(h => 
                        h.id === habitId ? { ...h, isCompleted: !completed } : h
                    )
                }));
            }
        }
    };

    return store;
}

export const habitStore = createHabitStore();