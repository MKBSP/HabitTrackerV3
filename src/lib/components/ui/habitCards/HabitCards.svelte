<!-- src/lib/components/ui/habitCards/HabitCards.svelte -->
<script lang="ts">
    import { Card, CardHeader } from "$lib/components/ui/card";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { cn } from "$lib/utils";
    import { slide } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import { Trash2 } from "lucide-svelte";
    import Button from "$lib/components/ui/button/button.svelte";

    const dispatch = createEventDispatcher();

    type Goal = {
        name: string;
        target: number;
        frequency: string;
    };

    // Props with types
    export let id: number;
    export let title: string;
    export let description: string;
    export let isCompleted: boolean;
    // Only include goal if it's being used
    export let goal: Goal | null = null;
    
    let checked = isCompleted;
    let isCollapsed = isCompleted;

    // Replace derived with reactive statement
    $: cardClasses = cn(
        "transition-all duration-300 ease-in-out habit-card",
        isCollapsed ? "scale-95 opacity-75 py-2" : "scale-100 opacity-100 py-4"
    );

    // Sync checked state with isCompleted prop
    $: checked = isCompleted;
    $: isCollapsed = isCompleted;

    async function handleCheckboxChange(newState: boolean) {
        checked = newState;
        isCollapsed = newState;
        await dispatch('complete', { habitId: id, completed: newState });
    }
</script>

<div 
    class="wrapper"
    transition:slide|local={{ duration: 300 }}
>
    <Card class={cardClasses}>
        <CardHeader class={cn(
            "flex flex-row items-center space-y-0 justify-between",
            isCollapsed ? "pb-1 pt-1" : "pb-2 pt-2"
        )}>
            <div class="flex items-center gap-4 flex-1">
                <Checkbox 
                    checked={checked}
                    onCheckedChange={handleCheckboxChange}
                />
                <div class="flex-1">
                    <h3 class={cn(
                        "font-semibold leading-none tracking-tight",
                        isCollapsed ? "text-sm text-muted-foreground" : "text-base"
                    )}>{title}</h3>
                    {#if !isCollapsed}
                        <p class="text-sm text-muted-foreground mt-1" transition:slide>
                            {description}
                        </p>
                        {#if goal}
                            <div class="mt-2 text-sm text-muted-foreground">
                                Goal: {goal.target} times per {goal.frequency}
                            </div>
                        {/if}
                    {/if}
                </div>
            </div>
            <Button 
                variant="ghost" 
                size="icon"
                class="text-destructive hover:text-destructive/90"
                on:click={() => dispatch('delete')}
            >
                <Trash2 class="h-4 w-4" />
            </Button>
        </CardHeader>
    </Card>
</div>

<style>
    .wrapper {
        position: relative;
        width: 100%;
    }
</style>