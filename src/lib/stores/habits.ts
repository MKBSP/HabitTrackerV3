import { writable, derived, get } from 'svelte/store';
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

function saveToStorage(state: HabitState) {
    if (browser) {
        try {
            localStorage.setItem('habitStore', JSON.stringify(state));
        } catch (e) {
            console.error('Failed to save habit state:', e);
        }
    }
}

function loadFromStorage(): HabitState | null {
    if (browser) {
        try {
            const stored = localStorage.getItem('habitStore');
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error('Failed to load habit state:', e);
            return null;
        }
    }
    return null;
}

function createHabitStore() {
    const stored = loadFromStorage();
    const initialState: HabitState = stored || {
        habits: [],
        loading: false,
        error: null,
        currentDate: new Date().toISOString(),
        initialized: false
    };

    const { subscribe, set, update } = writable<HabitState>(initialState);
    
    // Set up real-time subscription
    if (browser) {
        supabase
            .channel('habit-completions')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'Habit_Completion' },
                async (payload) => {
                    // Refresh habit data when completions change
                    await refreshHabitData();
                }
            )
            .subscribe();
    }

    async function refreshHabitData() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No authenticated user');

            // First get profile ID
            const { data: profile } = await supabase
                .from('Profiles')
                .select('id')
                .eq('user_auth_id', user.id)
                .single();
            
            if (!profile) throw new Error('Profile not found');

            // Then get habits using profile.id
            const { data: userHabits, error } = await supabase
                .from('User_Habits')
                .select(`
                    id,
                    habit_id,
                    user_id,
                    Habits (
                        id,
                        title,
                        description
                    ),
                    Habit_Completion (
                        completed,
                        completed_at,
                        created_at
                    )
                `)
                .eq('user_id', profile.id)
                .eq('is_active', true);

            if (error) throw error;

            const currentDate = new Date().toISOString().split('T')[0];
            const processedHabits = userHabits?.map(uh => ({
                id: uh.id, // Use user_habit_id as the main id
                habit_id: uh.habit_id,
                title: uh.Habits.title,
                description: uh.Habits.description,
                isCompleted: uh.Habit_Completion?.some(c => 
                    c.completed_at === currentDate && c.completed
                ) || false
            })) || [];

            // Get current state
            const currentState = get({ subscribe });
            const newState = { 
                ...currentState,
                habits: processedHabits,
                error: null 
            };

            updateState(newState);

        } catch (e) {
            console.error('Error refreshing habit data:', e);
            // Don't clear habits on error, just update error state
            updateState({ error: e.message });
        }
    }

    function updateState(newState: Partial<HabitState>) {
        update(state => {
            const updatedState = { ...state, ...newState };
            saveToStorage(updatedState);
            return updatedState;
        });
    }

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
                updateState({ loading: true, error: null });

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

                updateState({
                    habits,
                    currentDate,
                    loading: false,
                    initialized: true
                });

                return true;
            } catch (e) {
                console.error('[HabitStore] Error:', e);
                updateState({ 
                    error: e.message, 
                    loading: false,
                    initialized: false 
                });
                return false;
            }
        },

        async setCurrentDate(date: string, showLoading = true) {
            try {
                if (showLoading) {
                    updateState({ loading: true });
                }
                
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('No authenticated user');

                const { data: profile } = await supabase
                    .from('Profiles')
                    .select('id')
                    .eq('user_auth_id', user.id)
                    .single();
                
                if (!profile) throw new Error('No profile found');

                const habits = await fetchHabitsWithStatus(profile.id, date);
                
                updateState({ 
                    currentDate: date,
                    habits,
                    loading: false
                });
            } catch (e) {
                console.error('[HabitStore] Error:', e);
                updateState({ error: e.message, loading: false });
            }
        },

        async toggleComplete(habitId: number, completed: boolean) {
            const previousState = get({ subscribe });
            try {
                // Optimistic update - note we're now using the user_habit_id directly
                const newState = {
                    ...previousState,
                    habits: previousState.habits.map(h => 
                        h.id === habitId ? { ...h, isCompleted: completed } : h
                    )
                };
                
                updateState(newState);

                const { error } = await supabase
                    .from('Habit_Completion')
                    .insert({
                        user_habit_id: habitId,
                        completed_at: new Date().toISOString().split('T')[0],
                        completed: completed,
                        created_at: new Date().toISOString()
                    });

                if (error) throw error;

                // Only save to storage after successful DB update
                saveToStorage(newState);

                // Refresh data to ensure consistency
                await refreshHabitData();
            } catch (e) {
                console.error('[HabitStore] Toggle error:', e);
                // Revert to previous state on error
                updateState(previousState);
                saveToStorage(previousState);
            }
        },

        async deleteHabit(habitId: number) {
            try {
                // First fetch the habit to get accurate user_habit_id
                const { data: habit } = await supabase
                    .from('User_Habits')
                    .select('*')
                    .eq('id', habitId)
                    .single();

                if (!habit) throw new Error('Habit not found');

                const { error } = await supabase
                    .from('User_Habits')
                    .update({
                        is_active: false,
                        deleted_at: new Date().toISOString()
                    })
                    .eq('id', habitId);

                if (error) throw error;

                // Update store to remove habit
                updateState({
                    habits: previousState.habits.filter(h => h.id !== habitId)
                });

                return true;
            } catch (e) {
                console.error('[HabitStore] Error:', e);
                updateState({ error: e.message });
                return false;
            }
        },

        async findDuplicates() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('No authenticated user');

                const { data: habits } = await supabase
                    .from('User_Habits')
                    .select(`
                        id,
                        habit_id,
                        created_at,
                        is_active,
                        Habits (
                            id,
                            name
                        )
                    `)
                    .eq('user_id', user.id);

                if (!habits) return;

                // Group by habit_id
                const grouped = habits.reduce((acc, habit) => {
                    if (!acc[habit.habit_id]) {
                        acc[habit.habit_id] = [];
                    }
                    acc[habit.habit_id].push({
                        id: habit.id,
                        created_at: habit.created_at,
                        is_active: habit.is_active,
                        habit_name: habit.Habits.name
                    });
                    return acc;
                }, {});

                // Find duplicates
                const duplicates = Object.entries(grouped)
                    .filter(([_, entries]) => entries.length > 1)
                    .map(([habit_id, entries]) => ({
                        habit_id: Number(habit_id),
                        entries
                    }));

                console.log('=== Duplicate Habits Found ===', duplicates);                return duplicates;            } catch (error) {                console.error('Error finding duplicates:', error);                return null;            }
        },

        // Add new method to get completion status
        getCompletionStatus(habitId: number, date: string) {
            const state = get({ subscribe });
            const habit = state.habits.find(h => h.id === habitId);
            if (!habit) return false;

            return habit.isCompleted;
        },

        // Add method to get completions for date range
        async getCompletionsForRange(habitIds: number[], dateRange: { start: Date, end: Date }) {
            const state = get({ subscribe });
            return state.habits
                .filter(h => habitIds.includes(h.id))
                .map(h => ({
                    user_habit_id: h.id,
                    completed: h.isCompleted,
                    completed_at: state.currentDate
                }));
        }
    };

    return store;
}

export const habitStore = createHabitStore();