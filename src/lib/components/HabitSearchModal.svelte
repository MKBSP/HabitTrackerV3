<script lang="ts">
    import { Dialog, DialogContent, DialogHeader, DialogTitle } from "$lib/components/ui/dialog";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import { page } from '$app/stores';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let { open = false } = $props<{ open: boolean }>();
    let habits = $state<any[]>([]);
    let loading = $state(false);
    let searchTerm = $state('');

    async function fetchWithRetry(fn: () => Promise<any>, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (error) {
                console.error(`Attempt ${i + 1} failed:`, error);
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }

    async function fetchHabits() {
        const { supabase } = $page.data;
        loading = true;
        
        try {
            console.log('[HabitSearchModal] Fetching habits...');
            const { data, error } = await supabase
                .from('Habits')
                .select('id, name, description')
                .order('name');

            if (error) {
                console.error('[HabitSearchModal] Fetch error:', error);
                throw error;
            }
            
            habits = data || [];
            console.log('[HabitSearchModal] Fetched habits:', habits);
        } catch (error) {
            console.error('[HabitSearchModal] Error:', error);
            habits = [];
        } finally {
            loading = false;
        }
    }

    async function addHabit(habitId: number) {
        const { supabase } = $page.data;
        const userId = $page.data.session?.user.id;
        
        try {
            console.log('[HabitSearchModal] Adding habit:', { habitId, userId });
            
            const { data, error } = await supabase
                .from('User_Habits')
                .insert({
                    user_id: userId,
                    habit_id: habitId
                })
                .select()
                .single();

            if (error) {
                console.error('[HabitSearchModal] Add habit error:', error);
                throw error;
            }

            console.log('[HabitSearchModal] Habit added successfully:', data);
            dispatch('habitAdded');
            dispatch('close');
        } catch (error) {
            console.error('[HabitSearchModal] Add habit full error:', { error, habitId, userId });
        }
    }

    // Update effects for Svelte 5
    $effect(() => {
        console.log('[HabitSearchModal] Open state changed:', open);
        if (open) {
            fetchHabits();
        }
    });

    $effect(() => {
        if (searchTerm) {
            console.log('[HabitSearchModal] Search term:', searchTerm);
        }
    });
</script>

<Dialog 
    open={open} 
    onOpenChange={(isOpen: boolean) => dispatch('close')}
>
    <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
            <DialogTitle>Add Habits</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
            <Input 
                placeholder="Search habits..." 
                bind:value={searchTerm}
            />
            <div class="max-h-[300px] overflow-y-auto space-y-2">
                {#if loading}
                    <p class="text-center">Loading...</p>
                {:else if habits.length === 0}
                    <p class="text-center">No habits found</p>
                {:else}
                    {#each habits as habit}
                        <div class="flex items-center justify-between p-2 border rounded">
                            <div>
                                <h4 class="font-medium">{habit.name}</h4>
                                <p class="text-sm text-muted-foreground">{habit.description}</p>
                            </div>
                            <Button 
                                size="sm"
                                on:click={() => addHabit(habit.id)}
                            >
                                Add
                            </Button>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    </DialogContent>
</Dialog>