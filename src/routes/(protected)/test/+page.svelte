<script lang="ts">
    import GoalProgressTest2 from '$lib/components/goals/GoalProgressTest2.svelte';
    import { habitStore } from '$lib/stores/habits';
    import { goalStore } from '$lib/stores/goals';
    import { session } from '$lib/stores/auth';
    import { onMount } from 'svelte';

    let initialized = false;
    let error = null;

    onMount(async () => {
        try {
            console.log('Test page mounting...', { session: $session });
            const [habitsSuccess, goalsSuccess] = await Promise.all([
                habitStore.initialize(),
                goalStore.initialize()
            ]);
            
            initialized = true;
            
            // Extra debug info
            console.log('Stores initialized:', {
                habitsSuccess,
                goalsSuccess,
                goals: $goalStore.goals,
                habits: $habitStore.habits,
                storeState: {
                    goalsLoading: $goalStore.loading,
                    goalsError: $goalStore.error,
                }
            });
        } catch (e) {
            error = e;
            console.error('Test page error:', e);
        }
    });
</script>

<div class="container mx-auto py-6">
    <h1 class="text-2xl mb-4">Test Page</h1>
    
    {#if error}
        <div class="p-4 bg-red-100 mb-4">
            Error: {error.message}
        </div>
    {:else if !initialized}
        <div class="p-4 bg-yellow-100 mb-4">
            Loading...
        </div>
    {:else}
        <div class="p-4 bg-green-100 mb-4">
            <h2 class="font-bold mb-2">Debug Info:</h2>
            <pre class="text-sm overflow-auto">
Goals: {JSON.stringify($goalStore.goals, null, 2)}
Habits: {JSON.stringify($habitStore.habits, null, 2)}
            </pre>
        </div>
        <GoalProgressTest2 />
    {/if}
</div>