<script lang="ts">
    import { Dialog, DialogContent, DialogHeader, DialogTitle } from "$lib/components/ui/dialog";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import HabitSearchModal from "$lib/components/HabitSearchModal.svelte";
    import { supabase } from "$lib/supabase";
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import { writable } from "svelte/store";

    export let open = false;
    export let editingGoal: Goal | null = null;  // Changed from goal to editingGoal
    
    const dispatch = createEventDispatcher();

    // Form state
    const goalName = writable("");
    const goalDescription = writable("");
    const newKpi = writable({
        habit_id: null as number | null,
        habitName: '',
        target: 1,
        period: "week",
    });
    const addedKpis = writable<Array<typeof $newKpi>>([]);
    
    // Reset form when modal opens/closes
    $: if (!open) {
        setTimeout(() => {
            goalName.set("");
            goalDescription.set("");
            addedKpis.set([]);
            newKpi.set({ habit_id: null, habitName: '', target: 1, period: "week" });
        }, 100);
    }

    // Initialize form with goal data if editing
    $: if (open && editingGoal) {  // Changed from goal to editingGoal
        setTimeout(() => {
            goalName.set(editingGoal.name);
            goalDescription.set(editingGoal.description || '');
            addedKpis.set(editingGoal.kpis || []);
        }, 100);
    }

    function generateKpiName() {
        if (!$newKpi.habitName) return '';
        return `${$newKpi.habitName} ${$newKpi.target} time${$newKpi.target !== 1 ? 's' : ''} per ${$newKpi.period}`;
    }

    function addKpi() {
        if (!$newKpi.habit_id) return;
        addedKpis.update(kpis => [...kpis, {
            name: generateKpiName(),
            target: $newKpi.target,
            period: $newKpi.period,
            habit_ids: [$newKpi.habit_id]
        }]);
        newKpi.set({ habit_id: null, habitName: '', target: 1, period: "week" });
    }

    function removeKpi(index: number) {
        addedKpis.update(kpis => kpis.filter((_, i) => i !== index));
    }

    async function handleSubmit() {
        if (!$goalName) return;
        const data = {
            name: $goalName,
            description: $goalDescription,
            kpis: $addedKpis
        };

        const eventName = editingGoal ? 'update' : 'create';
        dispatch(eventName, data);
    }

    let userHabits: Array<{ id: number; name: string; }> = [];
    let showHabitModal = false;
    
    async function loadUserHabits() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('User_Habits')
            .select(`
                habit_id,
                Habits (
                    id,
                    name
                )
            `)
            .eq('user_id', user.id);

        if (data) {
            userHabits = data.map(uh => ({
                id: uh.Habits.id,
                name: uh.Habits.name
            }));
        }
    }

    onMount(loadUserHabits);

    // Update newKpi to include selected habits
    $: newKpi.update(kpi => ({ ...kpi, habit_ids: [] }));

    // Reactive KPI sentence preview
    $: kpiPreview = $newKpi.habitName ? 
        `${$newKpi.habitName} ${$newKpi.target} time${$newKpi.target !== 1 ? 's' : ''} per ${$newKpi.period}` : '';

    // Modified habit added handler to auto-select the new habit
    async function handleHabitAdded(event: CustomEvent) {
        await loadUserHabits();
        showHabitModal = false;
        
        // Get the last added habit (newest)
        const newHabit = userHabits[userHabits.length - 1];
        if (newHabit) {
            handleHabitSelect(newHabit);
        }
    }

    // When a habit is selected, update the habitName
    function handleHabitSelect(habit: { id: number, name: string }) {
        newKpi.update(kpi => ({ ...kpi, habit_id: habit.id, habitName: habit.name }));
    }

    function handleClose() {
        dispatch('close');
    }
</script>

<Dialog 
    {open} 
    on:openChange={handleClose}
>
    <DialogContent class="sm:max-w-[850px]">
        <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit' : 'Create New'} Goal</DialogTitle>  <!-- Changed from goal to editingGoal -->
        </DialogHeader>
        
        <div class="flex gap-4">
            <!-- Left side - Goal details -->
            <div class="w-1/2 space-y-4">
                <div class="space-y-2">
                    <label for="goalName" class="text-sm font-medium">Goal Name*</label>
                    <Input id="goalName" bind:value={$goalName} placeholder="Enter goal name" />
                </div>
                
                <div class="space-y-2">
                    <label for="goalDesc" class="text-sm font-medium">Description</label>
                    <Input id="goalDesc" bind:value={$goalDescription} placeholder="Enter description" />
                </div>

                <!-- Added KPIs -->
                <div class="space-y-2">
                    <label for="addedKpisList" class="text-sm font-medium">Added KPIs</label>
                    <div id="addedKpisList" class="space-y-2">
                        {#each $addedKpis as kpi, i}
                            <Card.Root class="p-3">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <div class="font-medium">{kpi.name}</div>
                                        <div class="text-sm text-muted-foreground">
                                            {kpi.target} time(s) per {kpi.period}
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        on:click={() => removeKpi(i)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </Card.Root>
                        {/each}
                    </div>
                </div>
            </div>

            <!-- Right side - KPI creation -->
            <div class="w-1/2 border-l pl-4 space-y-4">
                <div class="space-y-4">
                    <!-- Habit Selection -->
                    <div class="space-y-2">
                        <label for="habitSelect" class="text-sm font-medium">Select Habit</label>
                        <div class="relative">
                            <select
                                id="habitSelect"
                                class="w-full p-2 border rounded"
                                value={$newKpi.habit_id || ''}
                                on:change={(e) => {
                                    const habit = userHabits.find(h => h.id === +e.target.value);
                                    if (habit) handleHabitSelect(habit);
                                }}
                            >
                                <option value="">Select a habit...</option>
                                {#each userHabits as habit}
                                    <option value={habit.id}>{habit.name}</option>
                                {/each}
                            </select>
                            <Button 
                                variant="outline"
                                class="mt-2 w-full"
                                on:click={() => showHabitModal = true}
                            >
                                Add New Habit
                            </Button>
                        </div>
                    </div>

                    <!-- Target and Period -->
                    {#if $newKpi.habitName}
                        <div class="space-y-4">
                            <!-- Preview moved up to be more visible -->
                            <div class="p-4 bg-muted rounded">
                                <p class="font-medium">{kpiPreview}</p>
                            </div>

                            <div class="flex gap-4 items-end">
                                <div class="flex-1">
                                    <Input 
                                        type="number" 
                                        min="1"
                                        bind:value={$newKpi.target}
                                    />
                                </div>
                                <div class="flex-1">
                                    <select 
                                        class="w-full p-2 border rounded"
                                        bind:value={$newKpi.period}
                                    >
                                        <option value="day">per day</option>
                                        <option value="week">per week</option>
                                        <option value="month">per month</option>
                                    </select>
                                </div>
                            </div>

                            <Button 
                                class="w-full"
                                on:click={addKpi}
                                disabled={!$newKpi.habit_id}
                            >
                                Add to Goal
                            </Button>
                        </div>
                    {/if}
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-2 pt-4 mt-4 border-t">
            <Button variant="outline" on:click={handleClose}>
                Cancel
            </Button>
            <Button 
                on:click={handleSubmit}
                disabled={!$goalName || $addedKpis.length === 0}
            >
                {editingGoal ? 'Save Changes' : 'Create Goal'}
            </Button>
        </div>
    </DialogContent>
</Dialog>

<HabitSearchModal 
    open={showHabitModal}
    on:close={() => showHabitModal = false}
    on:habitAdded={handleHabitAdded}
/>