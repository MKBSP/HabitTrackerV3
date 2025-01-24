<script lang="ts">
    import * as Card from '$lib/components/ui/card';
    import { goalStore } from '$lib/stores/goals';
    import { habitStore } from '$lib/stores/habits';
    import { ChevronLeft, ChevronRight } from 'lucide-svelte';
    import { Button } from '$lib/components/ui/button';
    import { supabase } from '$lib/supabase';

    let currentGoalIndex = 0;
    const nextGoal = () => currentGoalIndex < $goalStore.goals.length - 1 && currentGoalIndex++;
    const previousGoal = () => currentGoalIndex > 0 && currentGoalIndex--;

    async function getCompletionsCount(habitId: number, period: 'day' | 'week' | 'month') {
        const now = new Date();
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);

        // Set start date based on period
        switch(period) {
            case 'week':
                const day = start.getDay();
                const diff = start.getDate() - day + (day === 0 ? -6 : 1);
                start.setDate(diff);
                break;
            case 'month':
                start.setDate(1);
                break;
        }

        // Get user_habit_id first
        const { data: userHabit } = await supabase
            .from('User_Habits')
            .select('id')
            .eq('habit_id', habitId)
            .single();

        if (!userHabit) return 0;

        // Get completions count
        const { data: completions } = await supabase
            .from('Habit_Completion')
            .select('*')
            .eq('user_habit_id', userHabit.id)
            .gte('completed_at', start.toISOString().split('T')[0])
            .lte('completed_at', now.toISOString().split('T')[0])
            .eq('completed', true);

        return completions?.length || 0;
    }

    function calculatePercentage(completions: number, target: number): number {
        return Math.round((completions / target) * 100);
    }

    $: currentGoal = $goalStore.goals[currentGoalIndex];
</script>

<Card.Root>
    <Card.Header class="flex flex-row items-center justify-between">
        <div>
            <Card.Title>Goal Progress</Card.Title>
            <Card.Description>Progress tracking</Card.Description>
        </div>
        {#if $goalStore.goals.length > 1}
            <div class="flex gap-2">
                <Button variant="ghost" size="icon" on:click={previousGoal} disabled={currentGoalIndex === 0}>
                    <ChevronLeft class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" on:click={nextGoal} disabled={currentGoalIndex === $goalStore.goals.length - 1}>
                    <ChevronRight class="h-4 w-4" />
                </Button>
            </div>
        {/if}
    </Card.Header>
    <Card.Content>
        {#if currentGoal}
            <div class="space-y-6">
                <h3 class="text-xl font-semibold">{currentGoal.name}</h3>
                <div class="space-y-4">
                    {#each currentGoal.kpis as kpi}
                        <div class="border-b pb-4 last:border-0">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <span class="font-medium">{kpi.name}</span>
                                    <div class="text-sm text-muted-foreground">
                                        Target: {kpi.target} times per {kpi.period}
                                    </div>
                                </div>
                                {#if kpi.habit_ids?.length}
                                    {#await getCompletionsCount(kpi.habit_ids[0], kpi.period)}
                                        <span class="text-sm">Calculating...</span>
                                    {:then count}
                                        <span class="text-lg font-semibold">
                                            {calculatePercentage(count, kpi.target)}%
                                        </span>
                                    {/await}
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {:else}
            <p class="text-muted-foreground">No goals available</p>
        {/if}
    </Card.Content>
</Card.Root>