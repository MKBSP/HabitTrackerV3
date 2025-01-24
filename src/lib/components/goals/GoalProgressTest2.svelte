<script lang="ts">
    import { goalStore } from '$lib/stores/goals';
    import { habitStore } from '$lib/stores/habits';
    import { supabase } from '$lib/supabase';
    
    // Update getDaysInPeriod to use current date and not show future dates
    function getDaysInPeriod(period: 'day' | 'week' | 'month'): Date[] {
        const now = new Date();
        const days = [];
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);

        switch(period) {
            case 'day':
                days.push(new Date(start));
                break;
            case 'week':
                const day = start.getDay();
                const monday = start.getDate() - day + (day === 0 ? -6 : 1);
                start.setDate(monday);
                // Only add days up to current date
                for(let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
                    days.push(new Date(d));
                }
                break;
            case 'month':
                start.setDate(1);
                // Only add days up to current date
                for(let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
                    days.push(new Date(d));
                }
                break;
        }
        return days;
    }

    async function getLatestCompletionStatus(habitId: number, date: Date) {
        const dateStr = date.toISOString().split('T')[0];
        console.log(`Checking completion for habit_id: ${habitId} on ${dateStr}`);

        // First get the user_habit_id
        const { data: userHabits } = await supabase
            .from('User_Habits')
            .select('id, habit_id')
            .eq('habit_id', habitId)
            .single();

        if (!userHabits) {
            console.log(`No user_habit found for habit_id: ${habitId}`);
            return false;
        }

        // Then get the completion status using user_habit_id
        const { data: completions } = await supabase
            .from('Habit_Completion')
            .select('*')
            .eq('user_habit_id', userHabits.id)
            .eq('completed_at', dateStr)
            .order('created_at', { ascending: false })
            .limit(1);
        
        const isCompleted = completions?.[0]?.completed ?? false;
        console.log(`Completion status for user_habit_id ${userHabits.id}: ${isCompleted}`);
        return isCompleted;
    }

    async function getCompletionsCount(habitId: number, days: Date[]) {
        const { data: userHabit } = await supabase
            .from('User_Habits')
            .select('id')
            .eq('habit_id', habitId)
            .single();

        if (!userHabit) return 0;

        const dateStrings = days.map(d => d.toISOString().split('T')[0]);
        
        const { data: completions } = await supabase
            .from('Habit_Completion')
            .select('*')
            .eq('user_habit_id', userHabit.id)
            .in('completed_at', dateStrings)
            .eq('completed', true);

        return completions?.length || 0;
    }

    function calculatePercentage(completions: number, target: number): number {
        return Math.round((completions / target) * 100);
    }

    // Modify the KPI processing to include target info
    $: kpisWithDetails = $goalStore.goals.flatMap(goal => 
        goal.kpis.map(kpi => ({
            kpiName: kpi.name,
            period: kpi.period,
            target: kpi.target,
            habitIds: kpi.habit_ids || [],
            days: getDaysInPeriod(kpi.period)
        }))
    );

    // Add debug logging
    $: {
        console.log('=== Debug Info ===', {
            goals: $goalStore.goals,
            kpis: kpisWithDetails,
            habits: $habitStore.habits
        });
    }
</script>

<div class="space-y-8 p-4 bg-yellow-100">
    {#if kpisWithDetails.length === 0}
        <div class="text-center p-4">No KPIs found</div>
    {:else}
        {#each kpisWithDetails as kpi}
            <div class="space-y-4 p-4 bg-white rounded shadow">
                <div class="mb-4">
                    <span class="text-lg font-bold block">KPI: {kpi.kpiName}</span>
                    <span class="block text-sm text-muted-foreground">Period: {kpi.period}</span>
                    <span class="block mt-2">Target: {kpi.target} times per {kpi.period}</span>
                </div>
                
                {#each kpi.habitIds as habitId}
                    <div class="ml-4 space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="font-medium">
                                {#if $habitStore.habits.find(h => h.id === habitId)}
                                    {$habitStore.habits.find(h => h.id === habitId).title}
                                {:else}
                                    Habit ID: {habitId} (Not found)
                                {/if}
                            </span>
                            {#await getCompletionsCount(habitId, kpi.days)}
                                <span>Calculating...</span>
                            {:then count}
                                <div class="text-sm space-x-2">
                                    <span>{count} / {kpi.target} completions</span>
                                    <span class="text-muted-foreground">
                                        ({calculatePercentage(count, kpi.target)}%)
                                    </span>
                                </div>
                            {/await}
                        </div>
                        <div class="ml-4 space-y-1">
                            {#each kpi.days as day}
                                {#await getLatestCompletionStatus(habitId, day)}
                                    <span>Loading {day.toLocaleDateString()}...</span>
                                {:then isCompleted}
                                    <div>
                                        <span>{day.toLocaleDateString('en-US', { 
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })}</span>
                                        <span class="ml-2">{isCompleted ? '✅' : '❌'}</span>
                                    </div>
                                {/await}
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        {/each}
    {/if}
</div>