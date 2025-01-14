import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { supabase } from '$lib/supabase';

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
}

function createGoalStore() {
    const { subscribe, set, update } = writable<GoalStore>({
        goals: [],
        loading: false,
        error: null
    });

    async function refreshGoals(userId: string) {
        try {
            const { data: goals, error } = await supabase
                .from('Goals')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return goals?.map(goal => ({
                ...goal,
                kpis: Array.isArray(goal.kpis) ? goal.kpis : []
            })) || [];
        } catch (e) {
            console.error('Error refreshing goals:', e);
            throw e;
        }
    }

    return {
        subscribe,
        initialize: async () => {
            if (!browser) return false;
            
            try {
                update(s => ({ ...s, loading: true, error: null }));
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('No authenticated user');

                const goals = await refreshGoals(user.id);
                update(s => ({
                    ...s,
                    goals,
                    loading: false
                }));

                return true;
            } catch (e) {
                console.error('[GoalStore] Error:', e);
                update(s => ({ ...s, error: e.message, loading: false }));
                return false;
            }
        },

        addGoal: async (name: string, description?: string, kpis: KPI[] = []) => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('No authenticated user');

                const goalData = {
                    name,
                    description,
                    user_id: user.id,
                    kpis: kpis.map(kpi => ({
                        name: kpi.name,
                        target: kpi.target,
                        period: kpi.period,
                        habit_ids: kpi.habit_ids || []
                    }))
                };

                console.log('Inserting goal:', goalData);

                const { data, error } = await supabase
                    .from('Goals')
                    .insert(goalData)
                    .select()
                    .single();

                if (error) {
                    console.error('Insert error:', error);
                    throw error;
                }

                const goals = await refreshGoals(user.id);
                update(s => ({ ...s, goals }));
                return true;
            } catch (e) {
                console.error('[GoalStore] Error:', e);
                return false;
            }
        },

        updateGoal: async (id: number, updates: Partial<Omit<Goal, 'id'>>) => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('No authenticated user');

                const { error } = await supabase
                    .from('Goals')
                    .update(updates)
                    .eq('id', id);

                if (error) throw error;

                const goals = await refreshGoals(user.id);
                update(s => ({ ...s, goals }));
                return true;
            } catch (e) {
                console.error('[GoalStore] Error:', e);
                return false;
            }
        },

        removeKpiFromGoal: async (goalId: number, kpiIndex: number) => {
            try {
                const store = get({ subscribe });
                const goal = store.goals.find(g => g.id === goalId);
                if (!goal) return false;

                const updatedKpis = [...goal.kpis];
                updatedKpis.splice(kpiIndex, 1);

                return await goalStore.updateGoal(goalId, { kpis: updatedKpis });
            } catch (e) {
                console.error('[GoalStore] Error:', e);
                return false;
            }
        }
    };
}

export const goalStore = createGoalStore();