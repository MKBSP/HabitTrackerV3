<script lang="ts">
    import * as Card from '$lib/components/ui/card';
    import HabitCardContainer from '$lib/components/habits/HabitCardContainer.svelte';
    import { onMount } from 'svelte';
    import { habitStore } from '$lib/stores/habits';
    import { session } from '$lib/stores/auth';
    import DailyHabitCompletionGraph from '$lib/components/graphs/DailyHabitCompletionGraph.svelte';

    let initError: string | null = null;

    onMount(async () => {
        console.log('=== Dashboard Mount ===', { session: $session });
        const success = await habitStore.initialize();
        if (!success) {
            initError = 'Failed to initialize habits. Please refresh the page.';
        }
        console.log('=== After Initialize ===', { 
            filtered: $habitStore.filtered,
            habits: $habitStore.habits 
        });
    });
</script>

<div class="container mx-auto py-6">
    <Card.Root>
        <Card.Header>
            <Card.Title>Dashboard</Card.Title>
            <Card.Description>Welcome to your habit tracking dashboard.</Card.Description>
        </Card.Header>
        <Card.Content>
            {#if initError}
                <div class="text-red-500 mb-4">{initError}</div>
            {:else if $habitStore.error}
                <div class="text-red-500 mb-4">{$habitStore.error}</div>
            {/if}
            <HabitCardContainer />
        </Card.Content>
    </Card.Root>
    <DailyHabitCompletionGraph />

</div>
