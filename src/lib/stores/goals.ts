import { writable, get, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { supabase } from '$lib/supabase';
import { fetchCompletions, getProcessedHabitData } from '$lib/data/habitService';
import { habitStore } from './habits';

export type KPI = {
    name: string;
    target: number;
    period: 'day' | 'week' | 'month';
    habit_ids?: number[];
}

export type Goal = {
    id: number;
    name: string;
    description?: string;
    kpis: KPI[];
    created_at: string;
    updated_at: string;
}

type GoalStore = {
    goals: Goal[];
    loading: boolean;
    error: string | null;
    completionsCache: Map<string, any[]>; // Add cache for completions
}

function createGoalStore() {
    const { subscribe, set, update } = writable<GoalStore>({
        goals: [],
        loading: false,
        error: null,
        completionsCache: new Map()
    });

    async function fetchCompletionsForKpi(kpi: KPI, dateRange: {start: Date, end: Date}) {
        const startStr = dateRange.start.toISOString().split('T')[0];
        const endStr = dateRange.end.toISOString().split('T')[0];

        console.log('=== KPI Query Start ===', {
            kpiName: kpi.name,
            target: kpi.target,
            period: kpi.period,
            dateRange: { startStr, endStr }
        });

        const { data: completions, error } = await supabase
            .from('Habit_Completion')
            .select('*')
            .in('user_habit_id', kpi.habit_ids || [])
            .gte('completed_at', startStr)
            .lte('completed_at', endStr)
            .order('completed_at', { ascending: false });

        if (error) {
            console.error('Fetch error:', error);
            return 0;
        }

        console.log('=== Raw Completions ===', completions);

        // Count total completions in the period
        const totalCompletions = completions.filter(c => c.completed).length;

        console.log('=== KPI Progress Calculation ===', {
            kpiName: kpi.name,
            totalCompletions,
            target: kpi.target,
            performance: (totalCompletions / kpi.target) * 100
        });

        return (totalCompletions / kpi.target) * 100;
    }

    return {
        subscribe,
        initialize: async () => {
            if (!browser) return false;
            try {
                update(s => ({ ...s, loading: true }));
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('No authenticated user');

                const { data: goals } = await supabase
                    .from('Goals')
                    .select('*')
                    .eq('user_id', user.id);

                update(s => ({
                    ...s,
                    goals: goals || [],
                    loading: false
                }));
                return true;
            } catch (e) {
                console.error('[GoalStore] Error:', e);
                update(s => ({ ...s, error: e.message, loading: false }));
                return false;
            }
        },
        // ...other CRUD operations...
        getKpiProgress: fetchCompletionsForKpi,
        clearCache: () => {
            update(s => ({ ...s, completionsCache: new Map() }));
        }
    };
}

export const goalStore = createGoalStore();