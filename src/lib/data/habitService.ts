import { browser } from '$app/environment';
import { supabase } from '$lib/supabase';

// Add type exports at the top
export type TransformedHabit = {
    id: number;
    title: string;
    description: string;
    isCompleted: boolean;
    created_at: string;
    deleted_at: string | null;
    goal: null;
};

type DateRange = {
    start: string;
    end: string;
};

// Cache implementation with browser check
class Cache {
    private getStorage() {
        return browser ? localStorage : null;
    }

    get(key: string) {
        const storage = this.getStorage();
        if (!storage) return null;
        
        const cached = storage.getItem(key);
        if (!cached) return null;

        try {
            return JSON.parse(cached);
        } catch {
            return null;
        }
    }

    set(key: string, data: any) {
        const storage = this.getStorage();
        if (!storage) return;
        storage.setItem(key, JSON.stringify(data));
    }

    clear(key: string) {
        const storage = this.getStorage();
        if (!storage) return;
        storage.removeItem(key);
    }
}

const cache = new Cache();

export async function fetchUserHabits(userId: string) {
    console.log('=== Fetching User Habits ===', { userId });
    const { data, error } = await supabase
        .from('User_Habits')
        .select(`
            id,
            created_at,
            is_active,
            deleted_at,
            habit_id,
            Habits!User_Habits_habit_id_fkey (
                id,
                name,
                description
            )
        `)
        .eq('user_id', userId);

    console.log('=== User Habits Raw Response ===', { data, error });
    
    if (error) throw error;
    
    // Transform data to match our expected format
    const transformedData = (data || []).map(uh => ({
        id: uh.id,
        habit_id: uh.habit_id,
        created_at: uh.created_at,
        is_active: uh.is_active,
        deleted_at: uh.deleted_at,
        Habits: {
            name: uh.Habits.name,
            description: uh.Habits.description
        }
    }));

    console.log('=== Transformed User Habits ===', transformedData);
    return transformedData;
}

export async function fetchCompletions(habitIds: number[], dateRange: { start: string, end: string }) {
    console.log('=== Fetching Completions ===', { habitIds, dateRange });
    const { data, error } = await supabase
        .from('Habit_Completion')
        .select('*')
        .in('user_habit_id', habitIds)
        .gte('completed_at', dateRange.start.split('T')[0])
        .lte('completed_at', dateRange.end.split('T')[0]);

    console.log('=== Completions Response ===', { data, error });
    if (error) throw error;
    return data || [];
}

type HabitWithStatus = {
    id: number;
    title: string;
    description: string;
    created_at: string;
    deleted_at: string | null;
    completions: {
        date: string;
        completed: boolean;
    }[];
}

export async function fetchHabitsWithStatus(userId: string, date: string) {
    console.log('=== Fetching Habits with Status ===', { userId, date });
    
    try {
        // Try cache first
        const cached = cache.get('habits-' + userId);
        if (cached?.date === date) {
            console.log('=== Using Cached Data ===');
            return cached.habits;
        }

        const habits = await fetchUserHabits(userId);
        const habitIds = habits.map(h => h.id);

        const [completions] = await Promise.all([
            fetchCompletions(habitIds, {
                start: date,
                end: date
            })
        ]);

        const transformedHabits = habits.map(habit => ({
            id: habit.id,
            title: habit.Habits.name,
            description: habit.Habits.description,
            created_at: habit.created_at,
            deleted_at: habit.deleted_at,
            isCompleted: completions.some(c => 
                c.user_habit_id === habit.id && 
                new Date(c.completed_at).toISOString().split('T')[0] === date.split('T')[0] &&
                c.completed
            ),
            goal: null
        }));

        // Cache the result
        if (browser) {
            cache.set('habits-' + userId, {
                date,
                habits: transformedHabits,
                timestamp: new Date().toISOString()
            });
        }

        return transformedHabits;
    } catch (error) {
        console.error('Error fetching habits with status:', error);
        throw error;
    }
}

// Make sure this is exported
export async function saveHabitCompletion(habitId: number, completed: boolean, date: string) {
    console.log('=== Saving Habit Completion ===', { habitId, completed, date });
    
    try {
        const dateOnly = date.split('T')[0];
        const { data: existing } = await supabase
            .from('Habit_Completion')
            .select('id')
            .eq('user_habit_id', habitId)
            .eq('completed_at', dateOnly)
            .maybeSingle();

        if (existing) {
            await supabase
                .from('Habit_Completion')
                .update({ completed })
                .eq('id', existing.id);
        } else {
            await supabase
                .from('Habit_Completion')
                .insert({
                    user_habit_id: habitId,
                    completed_at: dateOnly,
                    completed
                });
        }

        // Only clear specific habit cache
        if (browser) {
            cache.clear(`habits-${habitId}`);
        }

        return true;
    } catch (error) {
        console.error('Error saving habit completion:', error);
        throw error;
    }
}