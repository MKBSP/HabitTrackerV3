<script lang="ts">
    import * as Card from '$lib/components/ui/card';
    import HabitCardContainer from '$lib/components/habits/HabitCardContainer.svelte';
    import { onMount } from 'svelte';
    import { habitStore } from '$lib/stores/habits';
    import { goalStore } from '$lib/stores/goals';
    import { session } from '$lib/stores/auth';
    import DailyHabitCompletionGraph from '$lib/components/graphs/DailyHabitCompletionGraph.svelte';
    import GoalProgress from '$lib/components/goals/GoalProgress.svelte';
    import { Progress } from "$lib/components/ui/progress";
    
    let initError: string | null = null;
    let initialized = false;

    async function initialize() {
        try {
            console.log('=== Initializing Dashboard ===');
            const [habitsSuccess, goalsSuccess] = await Promise.all([
                habitStore.initialize(),
                goalStore.initialize()
            ]);

            if (!habitsSuccess) {
                initError = 'Failed to initialize habits';
            }
            
            initialized = true;
            console.log('=== Initialization Complete ===', {
                habits: $habitStore.habits,
                goals: $goalStore.goals
            });
        } catch (error) {
            console.error('Initialization error:', error);
            initError = 'Failed to initialize';
        }
    }

    onMount(initialize);

    // Calculate goal progress using habit store data directly
    $: goalPerformances = $goalStore.goals.map(goal => {
        const kpiProgress = goal.kpis.map(kpi => {
            // Get current state of tracked habits from habitStore
            const trackedHabits = $habitStore.habits.filter(h => 
                kpi.habit_ids?.includes(h.id)
            );

            // Count completed habits for current date
            const completedCount = trackedHabits.filter(h => h.isCompleted).length;
            const performance = (completedCount / kpi.target) * 100;

            return {
                ...kpi,
                performance
            };
        });

        const overallProgress = kpiProgress.reduce((sum, kpi) => 
            sum + kpi.performance, 0) / kpiProgress.length;

        return {
            ...goal,
            kpis: kpiProgress,
            overallProgress
        };
    });
</script>

<div class="container mx-auto py-6">
    {#if !initialized}
        <div class="text-center">
            <p>Loading dashboard...</p>
        </div>
    {:else if initError}
        <div class="text-red-500">
            <p>{initError}</p>
        </div>
    {:else}
        <div class="space-y-6">
            <Card.Root class="bg-green-100">
                <Card.Header>
                    <Card.Title>Dashboard</Card.Title>
                    <Card.Description>Welcome to your habit tracking dashboard.</Card.Description>
                </Card.Header>
                <Card.Content>
                    <div class="grid grid-cols-1 gap-6">
                        <!-- Habits Section -->
                        <div>
                            <HabitCardContainer />
                        </div>
                    </div>
                </Card.Content>
            </Card.Root>

            <GoalProgress />
            <DailyHabitCompletionGraph />
            
            <!-- Test Image -->
            <div class="mt-8 flex justify-center">
                <img 
                    src="https://picsum.photos/400/200" 
                    alt="Random test image" 
                    class="rounded-lg shadow-lg"
                />
            </div>
        </div>
    {/if}
</div>
