<script lang="ts">
    import * as Card from '$lib/components/ui/card';
    import HabitCardContainer from '$lib/components/habits/HabitCardContainer.svelte';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    let habits = $state<Array<{id: number; title: string; description: string; isCompleted: boolean; goal?: {name: string; target: number; frequency: string} | null}>>([]);
    let loading = $state(false);
    let error = $state<string | null>(null);

    async function fetchHabits(date = new Date().toISOString()) {
        const { supabase } = $page.data;
        const userId = $page.data.session?.user.id;
        const targetDate = date.split('T')[0];
        
        console.log('[Dashboard] Fetching habits for date:', targetDate);

        // First get user habits
        const { data: userHabits, error: userHabitsError } = await supabase
            .from('User_Habits')
            .select('id, habit_id')
            .eq('user_id', userId);

        if (userHabitsError) {
            console.error('Error fetching habits:', userHabitsError);
            return;
        }

        // Get latest completion status for each habit today
        const { data: completions, error: completionsError } = await supabase
            .from('Habit_Completion')
            .select('*')
            .in('user_habit_id', userHabits.map(h => h.id))
            .gte('completed_at', targetDate)
            .lt('completed_at', new Date(new Date(targetDate).getTime() + 24*60*60*1000).toISOString())
            .order('created_at', { ascending: false });

        console.log('[Dashboard] Raw completions:', completions);

        // Get latest completion for each habit
        const latestCompletions = completions?.reduce((acc, curr) => {
            if (!acc[curr.user_habit_id] || 
                new Date(curr.created_at) > new Date(acc[curr.user_habit_id].created_at)) {
                acc[curr.user_habit_id] = curr;
            }
            return acc;
        }, {} as Record<number, any>) || {};

        console.log('[Dashboard] Latest completions:', latestCompletions);

        // Then get habit details
        const habitIds = userHabits?.map(uh => uh.habit_id) || [];
        const { data: habitDetails, error: habitsError } = await supabase
            .from('Habits')
            .select('id, name, description')
            .in('id', habitIds);

        if (habitsError) {
            console.error('Error fetching habit details:', habitsError);
            return;
        }

        habits = userHabits?.map(uh => {
            const habitDetail = habitDetails?.find(h => h.id === uh.habit_id);
            const latestCompletion = latestCompletions[uh.id];
            
            return {
                id: uh.id,
                title: habitDetail?.name || 'Unknown Habit',
                description: habitDetail?.description || '',
                isCompleted: latestCompletion?.completed ?? false
            };
        }) || [];

        console.log('[Dashboard] Processed habits with completions:', habits);
    }

    onMount(fetchHabits);

    async function handleComplete(event: CustomEvent<{habitId: number, completed: boolean}>) {
        const { habitId, completed } = event.detail;
        const { supabase } = $page.data;
        const now = new Date();
        const today = now.toISOString();

        console.log('[Dashboard] Starting habit completion:', {
            habitId,
            completed,
            today,
            currentHabit: habits.find(h => h.id === habitId)
        });

        try {
            const payload = {
                user_habit_id: habitId,
                completed_at: today,
                completed: completed
            };

            const { data, error } = await supabase
                .from('Habit_Completion')
                .insert(payload)
                .select('*')
                .single();

            if (error) {
                console.error('[Dashboard] Insert Error:', error);
                throw error;
            }

            console.log('[Dashboard] Successfully inserted:', data);
            
            // Update local state after successful DB update
            habits = habits.map(h => 
                h.id === habitId 
                    ? { ...h, isCompleted: completed }
                    : h
            );
        } catch (error: any) {
            console.error('[Dashboard] Operation failed:', error);
            // No need to revert state as we're not updating it until after success
        }
    }

    function handleDateChange(event: CustomEvent<{date: string}>) {
        fetchHabits(event.detail.date);
    }
</script>

<div class="container mx-auto py-6">
    <Card.Root>
        <Card.Header>
            <Card.Title>Dashboard</Card.Title>
            <Card.Description>Welcome to your habit tracking dashboard.</Card.Description>
        </Card.Header>
        <Card.Content>
            <HabitCardContainer 
                {habits} 
                on:complete={handleComplete}
                on:refresh={fetchHabits}
                on:dateChange={handleDateChange}
            />
        </Card.Content>
    </Card.Root>
</div>