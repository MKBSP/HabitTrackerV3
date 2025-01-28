<script lang="ts">
    import * as Card from '$lib/components/ui/card';
    import HabitCardContainer from '$lib/components/habits/HabitCardContainer.svelte';
    import { onMount } from 'svelte';
    import { habitStore } from '$lib/stores/habits';
    import { session } from '$lib/stores/auth';
    import DailyHabitCompletionGraph from '$lib/components/graphs/Temp.svelte'; // Corrected import path

    let initError: string | null = null;
    let initialized = false;

    async function initialize() {
        try {
            console.log('=== Initializing Dashboard ===');
            const habitsSuccess = await habitStore.initialize();

            if (!habitsSuccess) {
                initError = 'Failed to initialize habits';
            }
            
            initialized = true;
            console.log('=== Initialization Complete ===', {
                habits: habitStore.habits // Corrected variable reference
            });
        } catch (error) {
            console.error('Initialization error:', error);
            initError = 'Failed to initialize';
        }
    }

    onMount(initialize);
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
            <Card.Root>
                <Card.Header>
                    <Card.Title>Dashboard</Card.Title>
                    <Card.Description>Welcome to your habit tracking dashboard.</Card.Description>
                </Card.Header>
                <Card.Content>
                    <div class="grid grid-cols-1 gap-6">
                        <div>
                            <HabitCardContainer />
                        </div>
                    </div>
                </Card.Content>
            </Card.Root>

            <DailyHabitCompletionGraph />
        
        </div>
    {/if}
</div>
