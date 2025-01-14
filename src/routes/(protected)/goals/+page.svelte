<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";  // Fix Card import
    import GoalCreationDialog from "./GoalCreationDialog.svelte";
    import { goalStore } from "$lib/stores/goals";
    import { onMount } from "svelte";

    let showCreateDialog = false;
    let editingGoal: Goal | null = null;

    onMount(async () => {
        console.log('Initializing goals store...');
        await goalStore.initialize();
    });

    async function handleCreateGoal(event: CustomEvent) {
        const { id, name, description, kpis } = event.detail;
        
        try {
            let success;
            if (editingGoal) {
                console.log('Updating goal:', { id: editingGoal.id, name, description, kpis });
                success = await goalStore.updateGoal(editingGoal.id, { name, description, kpis });
            } else {
                success = await goalStore.addGoal(name, description, kpis);
            }
            
            if (success) {
                editingGoal = null;
                showCreateDialog = false;
            }
        } catch (error) {
            console.error('Failed to save goal:', error);
        }
    }

    function closeDialog() {
        showCreateDialog = false;
        editingGoal = null;
    }

    async function handleKpiRemove(goalId: number, kpiIndex: number) {
        await goalStore.removeKpiFromGoal(goalId, kpiIndex);
    }

    function handleEdit(goal: Goal) {
        editingGoal = goal;
        showCreateDialog = true;
    }
</script>

<div class="container mx-auto py-6">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Goals</h1>
        <Button on:click={() => showCreateDialog = true}>
            Create Goal
        </Button>
    </div>

    <GoalCreationDialog 
        open={showCreateDialog}
        {editingGoal}
        on:close={closeDialog}
        on:create={handleCreateGoal}
        on:update={handleCreateGoal}
    />

    <!-- Goals list will go here -->
    {#if $goalStore.loading}
        <p>Loading goals...</p>
    {:else if $goalStore.error}
        <p class="text-red-500">{$goalStore.error}</p>
    {:else}
        <div class="grid gap-4">
            {#each $goalStore.goals as goal}
                <Card.Root class="p-6">  <!-- Now using Card.Root correctly -->
                    <div class="flex justify-between">
                        <!-- Goal Info -->
                        <div class="flex-1">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="text-xl font-semibold">{goal.name}</h3>
                                <Button 
                                    variant="ghost"
                                    size="sm"
                                    on:click={() => handleEdit(goal)}
                                >
                                    Edit
                                </Button>
                            </div>
                            {#if goal.description}
                                <p class="text-muted-foreground mb-4">{goal.description}</p>
                            {/if}
                            
                            <!-- KPIs List -->
                            <div class="space-y-3">
                                <h4 class="text-sm font-medium text-muted-foreground">KPIs</h4>
                                {#if goal.kpis && goal.kpis.length > 0}
                                    {#each goal.kpis as kpi, i}
                                        <div class="flex items-center gap-4 py-2 border-b last:border-0">
                                            <div class="flex-1">
                                                <span class="font-medium">{kpi.name}</span>
                                            </div>
                                            <div class="text-sm text-muted-foreground">
                                                {kpi.target} time{kpi.target !== 1 ? 's' : ''} per {kpi.period}
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <div class="w-24 text-right">
                                                    <span class="text-sm font-medium">0%</span>
                                                </div>
                                                <Button 
                                                    variant="ghost"
                                                    size="sm"
                                                    class="text-destructive"
                                                    on:click={() => handleKpiRemove(goal.id, i)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    {/each}
                                {:else}
                                    <p class="text-sm text-muted-foreground">No KPIs defined</p>
                                {/if}
                            </div>
                        </div>

                        <!-- Stats/Calculations Column -->
                        <div class="w-48 ml-6 pl-6 border-l">
                            <div class="space-y-2">
                                <div class="text-sm font-medium text-muted-foreground">Overall Progress</div>
                                <div class="text-2xl font-semibold">0%</div>
                                <div class="text-sm text-muted-foreground">
                                    This Week: 0/{goal.kpis?.length || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card.Root>
            {/each}
        </div>
    {/if}
</div>