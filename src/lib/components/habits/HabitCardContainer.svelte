<script lang="ts">
    import * as Card from '$lib/components/ui/card';
    import HabitCards from '$lib/components/ui/habitCards/HabitCards.svelte';
    import { createEventDispatcher } from 'svelte';
    import Button from '../ui/button/button.svelte';
    import HabitSearchModal from '../HabitSearchModal.svelte';
    import { Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-svelte"; // Add delete icon
    import { writable } from 'svelte/store';
    import { habitStore } from '$lib/stores/habits';

    const showAddModal = writable(false);
    const dispatch = createEventDispatcher();

    // Store state management
    $: {
        const debug = $habitStore.debug || { habitCount: 0, completionCount: 0, loading: false };
        const currentDate = $habitStore.currentDate;
        const filtered = $habitStore.filtered || []; // Ensure filtered is always an array
        const initialized = $habitStore.initialized;
        
        console.log('=== HabitContainer Full State ===', {
            initialized,
            loading: debug.loading,
            habits: debug.habitCount,
            date: currentDate,
            filteredData: filtered,
        });

        if (initialized && Array.isArray(filtered)) {
            console.log('=== Habits Updated ===', {
                length: filtered.length,
                firstHabit: filtered[0],
                allHabits: filtered
            });
        }
    }

    // Remove local habits array and use store directly
    $: habits = $habitStore.habits || [];
    
    $: console.log('=== Container Habits ===', {
        habits,
        storeHabits: $habitStore.habits,
        initialized: $habitStore.initialized
    });

    // Action handlers
    async function handleHabitComplete(habitId: number, completed: boolean) {
        console.log('Completing habit:', habitId, completed);
        await habitStore.toggleComplete(habitId, completed);
    }

    async function handleDeleteHabit(habitId: number) {
        if (confirm('Are you sure you want to delete this habit?')) {
            await habitStore.deleteHabit(habitId);
        }
    }

    function toggleModal(value: boolean) {
        $showAddModal = value;
    }

    function handleHabitAdded() {
        habitStore.initialize();
        toggleModal(false);
    }

    function changeDate(days: number) {
        const date = new Date($habitStore.currentDate);
        date.setDate(date.getDate() + days);
        console.log('Changing date to:', date.toISOString());
        habitStore.setCurrentDate(date.toISOString());
    }

    function formatDate(date: string | null): string {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }
</script>

{#if !$habitStore.initialized}
    <div class="w-1/2 mx-auto p-4 text-center">
        <p>Initializing habit tracking...</p>
    </div>
{:else if $habitStore.loading}
    <div class="w-1/2 mx-auto p-4 text-center">
        <p>Loading habits...</p>
    </div>
{:else}
    <div class="w-1/2 mx-auto">
        <Card.Root class="card">
            <Card.Header class="flex flex-col space-y-2">
                <div class="flex items-center justify-between w-full">
                    <div>
                        <Card.Title>Today's Habits</Card.Title>
                        <Card.Description>Track your daily progress</Card.Description>
                    </div>
                    <Button variant="outline" size="icon" on:click={() => toggleModal(true)}>
                        <Plus class="h-4 w-4" />
                    </Button>
                </div>
                
                <div class="flex items-center justify-center gap-4 text-sm">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        class="hover:bg-secondary/90"
                        on:click={() => changeDate(-1)}
                    >
                        <ChevronLeft class="h-4 w-4" />
                    </Button>
                    
                    <span>
                        {formatDate($habitStore.currentDate)}
                    </span>
                    
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        on:click={() => changeDate(1)}
                    >
                        <ChevronRight class="h-4 w-4" />
                    </Button>
                </div>
            </Card.Header>
            <Card.Content class="space-y-4 max-h-[600px] overflow-y-auto">
                {#each habits as habit (habit.id)}
                    <HabitCards
                        id={habit.id}
                        title={habit.title}
                        description={habit.description}
                        isCompleted={habit.isCompleted}
                        goal={habit.goal}
                        on:complete={({ detail }) => handleHabitComplete(habit.id, detail.completed)}
                        on:delete={() => handleDeleteHabit(habit.id)}
                    />
                {/each}
            </Card.Content>
        </Card.Root>
    </div>

    <HabitSearchModal 
        open={$showAddModal}
        on:close={() => toggleModal(false)}
        on:habitAdded={handleHabitAdded}
    />
{/if}