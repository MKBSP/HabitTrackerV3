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

// Add new type
export type ProcessedHabitData = {
    date: string;
    habits: Array<{
        id: number;
        title: string;
        isCompleted: boolean;
    }>;
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

    // First get all completions in date range
    try {
        const { data: completions, error } = await supabase
            .from('Habit_Completion')
            .select('*')
            .in('user_habit_id', habitIds)
            .gte('completed_at', dateRange.start.split('T')[0])
            .lte('completed_at', dateRange.end.split('T')[0])
            .eq('completed', true) // Only get true completions
            .order('created_at', { ascending: false });

        if (error) throw error;

        return completions || [];
    } catch (error) {
        console.error('Error fetching completions:', error);
        return [];
    }
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
        const selectedDate = new Date(date);
        
        // Modify the query to properly filter active habits
        const { data: habits, error } = await supabase
            .from('User_Habits')
            .select(`
                id,
                created_at,
                is_active,
                deleted_at,
                Habits (
                    id,
                    name,
                    description
                )
            `)
            .eq('user_id', userId)
            .eq('is_active', true)
            .is('deleted_at', null)  // Only get non-deleted habits
            .lte('created_at', selectedDate.toISOString());

        if (error) throw error;

        console.log('=== Fetched Habits ===', habits);

        // Get completions for filtered habits
        const habitIds = habits.map(h => h.id);
        const completions = await fetchCompletions(habitIds, {
            start: date,
            end: date
        });

        // Transform data
        return habits.map(habit => ({
            id: habit.id,
            title: habit.Habits.name,
            description: habit.Habits.description,
            created_at: habit.created_at,
            deleted_at: habit.deleted_at,
            isCompleted: completions.some(c => 
                c.user_habit_id === habit.id && 
                c.completed
            ),
            completions: completions.filter(c => c.user_habit_id === habit.id)
        }));

    } catch (error) {
        console.error('Error fetching habits with status:', error);
        throw error;
    }
}

// Make sure this is exported
export async function saveHabitCompletion(habitId: number, completed: boolean, date: string) {
    console.log('=== Saving Habit Completion ===', { habitId, completed, date });
    
    try {
        const dateOnly = new Date(date).toISOString().split('T')[0];

        // First get existing completion
        const { data: existing } = await supabase
            .from('Habit_Completion')
            .select('id, completed')
            .eq('user_habit_id', habitId)
            .eq('completed_at', dateOnly)
            .maybeSingle();

        if (existing) {
            // Update existing record
            await supabase
                .from('Habit_Completion')
                .update({ completed })
                .eq('id', existing.id);
        } else if (completed) {
            // Only create new record if completing
            await supabase
                .from('Habit_Completion')
                .insert({
                    user_habit_id: habitId,
                    completed_at: dateOnly,
                    completed
                });
        }

        // Only clear cache for affected habit
        if (browser) {
            cache.clear(`habits-${habitId}`);
            const { goalStore } = await import('$lib/stores/goals');
            await goalStore.triggerRecalculation();
        }

        return true;
    } catch (error) {
        console.error('Error saving habit completion:', error);
        throw error;
    }
}

// Add new function to get processed habit data
export async function getProcessedHabitData(startDate: string, endDate: string): Promise<ProcessedHabitData[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days: ProcessedHabitData[] = [];
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        const { data: habits } = await supabase
            .from('Habit_Completion')
            .select('user_habit_id, completed')
            .eq('completed_at', dateStr);

        days.push({
            date: dateStr,
            habits: habits?.map(h => ({
                id: h.user_habit_id,
                isCompleted: h.completed
            })) || []
        });
    }

    return days;
}