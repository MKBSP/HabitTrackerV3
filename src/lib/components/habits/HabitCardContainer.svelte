<script lang="ts">
    import * as Card from '$lib/components/ui/card';
    import HabitCards from '$lib/components/ui/habitCards/HabitCards.svelte';
    import { createEventDispatcher } from 'svelte';
    import Button from '../ui/button/button.svelte';
    import HabitSearchModal from '../HabitSearchModal.svelte';
    import { Plus } from "lucide-svelte";

    type Habit = {
        id: number;
        title: string;
        description: string;
        isCompleted: boolean;
        goal?: {name: string; target: number; frequency: string} | null;
    };

    let { habits } = $props<{ habits: Habit[] }>();

    const dispatch = createEventDispatcher();

    // Convert reactive statement to $effect
    $effect(() => {
        console.log("HabitCardContainer received habits:", habits);
    });

    function handleHabitComplete(habitId: number, completed: boolean) {
        const habit = habits.find(h => h.id === habitId);
        console.log("[HabitCardContainer] Processing completion:", {
            habitId,
            completed,
            habitFound: !!habit,
            habit,
            allHabitIds: habits.map(h => h.id)
        });
        
        if (!habit) {
            console.error("[HabitCardContainer] Habit not found:", habitId);
            return;
        }

        dispatch('complete', { habitId, completed });
    }

    // Add validation effect
    $effect(() => {
        const invalidHabits = habits.filter(h => !h.id);
        if (invalidHabits.length > 0) {
            console.warn("[HabitCardContainer] Found habits without IDs:", invalidHabits);
        }
    });

    let showAddModal = $state(false);

    function toggleModal(value: boolean) {
        console.log('[HabitCardContainer] Toggling modal:', value);
        showAddModal = value;
    }

    function handleHabitAdded() {
        console.log('[HabitCardContainer] Habit added, closing modal');
        showAddModal = false;
        dispatch('refresh');
    }
</script>

<div class="w-1/2 mx-auto">
    <Card.Root>
        <Card.Header class="flex flex-row items-center justify-between">
            <div>
                <Card.Title>Today's Habits</Card.Title>
                <Card.Description>Track your daily progress</Card.Description>
            </div>
            <Button variant="outline" size="icon" on:click={() => toggleModal(true)}>
                <Plus class="h-4 w-4" />
            </Button>
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
                />
            {/each}
        </Card.Content>
    </Card.Root>
</div>

<HabitSearchModal 
    open={showAddModal}
    on:close={() => toggleModal(false)}
    on:habitAdded={handleHabitAdded}
/>