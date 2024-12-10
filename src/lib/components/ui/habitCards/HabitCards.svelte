<script lang="ts">
    import { Card, CardContent, CardHeader } from "$lib/components/ui/card";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { cn } from "$lib/utils";
    import { slide } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    type HabitCardProps = {
        id: number;
        title: string;
        description: string;
        isCompleted: boolean;
        goal?: { name: string; target: number; frequency: string } | null;
    };

    let { id, title, description, isCompleted, goal = null } = $props<HabitCardProps>();

    let checked = $state(isCompleted);
    let isCollapsed = $state(isCompleted);

    // Replace reactive statement with $effect
    $effect(() => {
        if (checked !== isCompleted) {
            checked = isCompleted;
            isCollapsed = isCompleted;
            console.log("[HabitCard] State synced:", { id, checked, isCompleted });
        }
    });

    // Replace reactive classes with $derived
    let cardClasses = $derived(cn(
        "transition-all duration-300 ease-in-out habit-card",
        isCollapsed ? "scale-95 opacity-75 py-2" : "scale-100 opacity-100 py-4"
    ));

    async function handleCheckboxChange(newState: boolean) {
        console.log("[HabitCard] Starting checkbox change:", {
            id,
            newState,
            currentState: checked,
            isCompleted
        });

        try {
            checked = newState;
            isCollapsed = newState;
            
            console.log("[HabitCard] Dispatching completion event:", {
                habitId: id,
                completed: newState
            });
            
            await dispatch('complete', { habitId: id, completed: newState });
            
            console.log("[HabitCard] Completion event handled successfully");
        } catch (error) {
            console.error("[HabitCard] Error handling checkbox:", {
                error,
                id,
                newState,
                previousState: !newState
            });
            
            // Revert states
            checked = !newState;
            isCollapsed = !newState;
        }
    }
</script>

<Card class={cardClasses}>
    <CardHeader class={cn(
        "flex flex-row items-center space-y-0",
        isCollapsed 
            ? "pb-1 pt-1" // Reduced padding when collapsed
            : "pb-2 pt-2"  // Normal padding when expanded
    )}>
        <div class="flex-1 transition-all duration-300">
            <h3 class={cn(
                "font-semibold leading-none tracking-tight",
                isCollapsed 
                    ? "text-sm text-muted-foreground" // Smaller text when collapsed
                    : "text-base" // Normal text size when expanded
            )}>{title}</h3>
            {#if !isCollapsed}
                <p class="text-sm text-muted-foreground mt-1" transition:slide>{description}</p>
            {/if}
        </div>
        <Checkbox 
            checked={checked}
            onCheckedChange={handleCheckboxChange}
        />
    </CardHeader>
</Card>