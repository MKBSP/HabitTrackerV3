<script lang="ts">
    import { Dialog, DialogContent, DialogHeader, DialogTitle } from "$lib/components/ui/dialog";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import { page } from '$app/stores';
    import { createEventDispatcher } from 'svelte';
    import { writable, derived } from 'svelte/store';
    import { supabase } from '$lib/supabase';

    export let open = false;

    const dispatch = createEventDispatcher();

    type Habit = {
        id: number;
        name: string;
        description: string;
        is_generic?: boolean;
    };

 // Local stores
    const habits = writable<Habit[]>([]);
    const loading = writable(false);
    const searchTerm = writable('');
    const showCreateForm = writable(false);
    const newHabitName = writable('');
    const newHabitDescription = writable('');
    const error = writable<string | null>(null);

    const filteredHabits = derived(
        [habits, searchTerm],
        ([$habits, $searchTerm]) => $searchTerm
            ? $habits.filter(habit => 
                habit.name.toLowerCase().includes($searchTerm.toLowerCase()) ||
                (habit.description && habit.description.toLowerCase().includes($searchTerm.toLowerCase()))
            )
            : $habits
    );

    let currentUser: any = null;

    // Add initialization check
    async function initializeAuth() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Auth error:', error);
            return;
        }
        currentUser = user;
    }

    async function fetchHabits() {
        loading.set(true);
        error.set(null);
        
        try {
            await initializeAuth(); // Ensure auth is initialized
            
            const { data, error: fetchError } = await supabase
                .from('Habits')
                .select('id, name, description')
                .order('name');

            if (fetchError) throw fetchError;
            habits.set(data || []);
        } catch (err) {
            console.error('[HabitSearchModal] Error:', err);
            error.set('Failed to fetch habits');
            habits.set([]);
        } finally {
            loading.set(false);
        }
    }

    async function addHabit(habitId: number) {
        try {
            if (!currentUser) {
                await initializeAuth();
                if (!currentUser) throw new Error('No authenticated user');
            }

            const { error: insertError } = await supabase
                .from('User_Habits')
                .insert({
                    user_id: currentUser.id,
                    habit_id: habitId
                });

            if (insertError) throw insertError;

            dispatch('habitAdded');
            dispatch('close');
        } catch (err) {
            console.error('[HabitSearchModal] Error adding habit:', err);
            error.set('Failed to add habit');
        }
    }

    async function createAndAddHabit() {
        if (!$newHabitName.trim()) {
            error.set('Habit name is required');
            return;
        }

        try {
            const { data: habitData, error: habitError } = await supabase
                .from('Habits')
                .insert({
                    name: $newHabitName,
                    description: $newHabitDescription,
                    is_generic: false
                })
                .select()
                .single();

            if (habitError) throw habitError;
            if (habitData) await addHabit(habitData.id);

            newHabitName.set('');
            newHabitDescription.set('');
            showCreateForm.set(false);
        } catch (err) {
            console.error('[HabitSearchModal] Error creating habit:', err);
            error.set('Failed to create habit');
        }
    }

    function handleFormSubmit(e: Event) {
        e.preventDefault();
        createAndAddHabit();
    }

    // Update the initialization trigger
    $: if (open) {
        fetchHabits();
        initializeAuth();
    }
</script>

<Dialog 
    {open}
    on:openChange={() => dispatch('close')}
>
    <DialogContent class="sm:max-w-[850px]">
        <DialogHeader>
            <DialogTitle>Add Habits</DialogTitle>
        </DialogHeader>
        <div class="flex gap-4">
            <!-- Search and Results -->
            <div class="w-1/2 space-y-4">
                <Input 
                    placeholder="Search habits..." 
                    bind:value={$searchTerm}
                />
                {#if $error}
                    <div class="text-red-500 text-sm">{$error}</div>
                {/if}
                <div class="max-h-[400px] overflow-y-auto space-y-2">
                    {#if $loading}
                        <p class="text-center">Loading...</p>
                    {:else if $filteredHabits.length === 0}
                        <div class="text-center">
                            <p>No habits found</p>
                        </div>
                    {:else}
                        {#each $filteredHabits as habit}
                            <div class="flex items-center justify-between p-2 border rounded">
                                <div>
                                    <h4 class="font-medium">{habit.name}</h4>
                                    <p class="text-sm text-muted-foreground">{habit.description}</p>
                                </div>
                                <Button 
                                    variant="outline"
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

            <!-- Create Form -->
            {#if $showCreateForm}
                <div class="w-1/2 border-l pl-4">
                    <form 
                        class="space-y-4" 
                        on:submit={handleFormSubmit}
                    >
                        <div class="space-y-2">
                            <label for="habitName" class="text-sm font-medium">Habit Name*</label>
                            <Input 
                                id="habitName"
                                bind:value={$newHabitName}
                                required
                                placeholder="Enter habit name"
                            />
                        </div>
                        <div class="space-y-2">
                            <label for="habitDesc" class="text-sm font-medium">Description</label>
                            <Input 
                                id="habitDesc"
                                bind:value={$newHabitDescription}
                                placeholder="Enter habit description"
                            />
                        </div>
                        <div class="flex justify-end gap-2">
                            <Button 
                                type="button" 
                                variant="outline"
                                on:click={() => showCreateForm.set(false)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit"
                                disabled={!$newHabitName}
                            >
                                Save and Add
                            </Button>
                        </div>
                    </form>
                </div>
            {/if}
        </div>

        <!-- Create New Habit Button -->
        <div class="pt-4 mt-4 border-t">
            <Button 
                variant="outline" 
                class="w-full"
                on:click={() => showCreateForm.set(true)}
            >
                Create New Habit
            </Button>
        </div>
    </DialogContent>
</Dialog>