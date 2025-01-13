<script lang="ts">
    import { onMount } from 'svelte';
    import { select } from 'd3-selection';
    import { scaleBand, scaleLinear } from 'd3-scale';
    import { habitStore } from '$lib/stores/habits';
    import * as Card from '$lib/components/ui/card';
    import { axisBottom, axisLeft } from 'd3-axis';
    import { line as d3Line, curveMonotoneX } from 'd3-shape';
    import { scaleTime } from 'd3-scale';
    import { Button } from '$lib/components/ui/button';
    import { supabase } from '$lib/supabase';

    let chartElement: HTMLDivElement;
    let debugInfo: any = {};
    
    // Available range options
    const ranges = [
        { label: '14 Days', days: 14 },
        { label: '30 Days', days: 30 },
        { label: '90 Days', days: 90 },
        { label: 'All Time', days: 365 } // We can adjust this based on your needs
    ];
    let selectedRange = ranges[0];

    // Get the actual real-world current date
    const actualCurrentDate = new Date();
    actualCurrentDate.setHours(0, 0, 0, 0);

    function getDaysInRange(days: number) {
        const dates = [];
        // Use actualCurrentDate instead of today
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(actualCurrentDate);
            date.setDate(date.getDate() - i);
            dates.push(date);
        }
        return dates;
    }

    function formatDate(date: Date) {
        return date.toISOString().split('T')[0];
    }

    // Enhanced completion tracking
    function getCompletionsForDate(habit: any, dateStr: string) {
        return habit.completions?.some(c => 
            formatDate(new Date(c.completed_at)) === dateStr && c.completed
        ) || false;
    }

    function getAllTimeRange() {
        const dates = new Set<string>();
        // Get all unique dates from completions
        $habitStore.habits.forEach(habit => {
            habit.completions?.forEach(c => {
                const completionDate = new Date(c.completed_at);
                // Only include dates up to actual current date
                if (completionDate <= actualCurrentDate) {
                    dates.add(formatDate(completionDate));
                }
            });
        });

        if (dates.size === 0) {
            return getDaysInRange(14); // Fallback to 14 days if no completions
        }

        // Convert to array and sort
        const sortedDates = Array.from(dates)
            .map(d => new Date(d))
            .sort((a, b) => a.getTime() - b.getTime());

        // Generate all dates between first and actual current date
        const allDates = [];
        const firstDate = sortedDates[0];

        for (let d = new Date(firstDate); d <= actualCurrentDate; d.setDate(d.getDate() + 1)) {
            allDates.push(new Date(d));
        }

        return allDates;
    }

    // Remove the today reactive declaration since we use actualCurrentDate
    $: dates = selectedRange.label === 'All Time' ? 
        getAllTimeRange() : 
        getDaysInRange(selectedRange.days);
    
    // Store the full completion data separately from habitStore
    let completionsData: any[] = [];
    
    async function fetchCompletionsForDateRange(habitIds: number[], startDate: Date, endDate: Date) {
        const { data, error } = await supabase
            .from('Habit_Completion')
            .select('*')
            .in('user_habit_id', habitIds)
            .gte('completed_at', startDate.toISOString().split('T')[0])
            .lte('completed_at', endDate.toISOString().split('T')[0])
            .eq('completed', true);

        if (error) {
            console.error('Error fetching completions:', error);
            return [];
        }
        return data || [];
    }

    async function updateCompletionsData() {
        const habitIds = $habitStore.habits.map(h => h.id);
        const endDate = new Date();
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - selectedRange.days);
        
        completionsData = await fetchCompletionsForDateRange(habitIds, startDate, endDate);
    }

    // Watch for changes in selected range or habits
    $: if ($habitStore.habits.length > 0) {
        updateCompletionsData();
    }

    // Reactive data processing that updates when habits change or range changes
    $: data = dates.map(date => {
        const dateStr = formatDate(date);
        console.log(`\n=== Processing date: ${dateStr} ===`);
        
        const completions = $habitStore.habits.reduce((count, habit) => {
            // Use completionsData instead of habit.completions
            const completed = completionsData.some(c => 
                c.user_habit_id === habit.id && 
                formatDate(new Date(c.completed_at)) === dateStr
            );
            console.log(`${habit.title}: ${completed ? 'completed' : 'not completed'}`);
            return count + (completed ? 1 : 0);
        }, 0);
        
        return {
            date,
            name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: completions
        };
    });

    $: {
        debugInfo = {
            habitsCount: $habitStore.habits.length,
            datesCount: dates.length,
            dataPoints: data,
            hasCompletions: data.some(d => d.value > 0)
        };
        console.log('=== Final Graph Data ===', debugInfo);
    }

    $: totalHabits = $habitStore.habits.length;

    function calculateTrendLine(data: any[]) {
        const xVals = data.map((d, i) => i);
        const yVals = data.map(d => d.value);
        
        const xMean = xVals.reduce((a, b) => a + b, 0) / xVals.length;
        const yMean = yVals.reduce((a, b) => a + b, 0) / yVals.length;
        
        const slope = xVals.map((x, i) => [x - xMean, yVals[i] - yMean])
            .reduce((a, [x, y]) => a + x * y, 0) 
            / xVals.map(x => Math.pow(x - xMean, 2))
                .reduce((a, b) => a + b, 0);
        
        const intercept = yMean - slope * xMean;
        
        return data.map((d, i) => ({
            date: d.date,
            value: slope * i + intercept
        }));
    }

    function calculateWeeklyTrendLines(data: any[]) {
        // Group data points by week (Monday-Sunday)
        const weeklyData: { [key: string]: any[] } = {};
        
        data.forEach(point => {
            const date = new Date(point.date);
            // Get Monday of the week
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            const monday = new Date(date.setDate(diff));
            const weekKey = monday.toISOString().split('T')[0];
            
            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = [];
            }
            weeklyData[weekKey].push(point);
        });

        // Calculate trend line for each week
        return Object.entries(weeklyData).map(([weekStart, points]) => {
            if (points.length < 2) return null; // Skip weeks with insufficient data

            const xVals = points.map((_, i) => i);
            const yVals = points.map(p => p.value);
            
            const xMean = xVals.reduce((a, b) => a + b, 0) / xVals.length;
            const yMean = yVals.reduce((a, b) => a + b, 0) / yVals.length;
            
            const slope = xVals.map((x, i) => [x - xMean, yVals[i] - yMean])
                .reduce((a, [x, y]) => a + x * y, 0) 
                / xVals.map(x => Math.pow(x - xMean, 2))
                    .reduce((a, b) => a + b, 0);
            
            const intercept = yMean - slope * xMean;
            
            return {
                weekStart,
                points: points.map((p, i) => ({
                    date: p.date,
                    value: slope * i + intercept
                }))
            };
        }).filter(Boolean);
    }
    
    // Add this to track last completion update
    let lastCompletionUpdate = 0;

    // Subscribe to habit completions
    $: {
        // This will trigger when habits are updated (including completions)
        if ($habitStore.habits.length > 0) {
            lastCompletionUpdate = Date.now();
            updateCompletionsData();
        }
    }

    // Update completionsData reactively when either habits change or a completion is toggled
    $: {
        if (lastCompletionUpdate && $habitStore.habits.length > 0) {
            console.log('=== Updating Graph Data ===', { 
                lastUpdate: new Date(lastCompletionUpdate).toISOString(),
                habitCount: $habitStore.habits.length
            });
            updateCompletionsData();
        }
    }

    // Listen for habit completion events
    function handleHabitUpdate() {
        lastCompletionUpdate = Date.now();
    }

    onMount(() => {
        // Subscribe to habit completion events
        const unsubscribe = habitStore.subscribe(state => {
            if (state.habits.length > 0) {
                handleHabitUpdate();
            }
        });

        return () => unsubscribe();
    });

    $: if (chartElement && data) {
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = chartElement.clientWidth - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        select(chartElement).selectAll('*').remove();

        const svg = select(chartElement)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = scaleTime()
            .domain([dates[0], dates[dates.length - 1]])
            .range([0, width]);

        const y = scaleLinear()
            .domain([0, totalHabits])  // Set max to total number of habits
            .range([height, 0]);

        const lineGenerator = d3Line<any>()
            .x(d => x(d.date))
            .y(d => y(d.value))
            .curve(curveMonotoneX);

        // Optional light grid lines at whole numbers only
        svg.selectAll('grid-line')
            .data([...Array(totalHabits + 1).keys()]) // Creates array [0,1,2,...totalHabits]
            .enter()
            .append('line')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', d => y(d))
            .attr('y2', d => y(d))
            .attr('stroke', 'currentColor')
            .attr('stroke-opacity', 0.1);

        // Add weekly trend lines
        const weeklyTrends = calculateWeeklyTrendLines(data);
        weeklyTrends.forEach(week => {
            svg.append('path')
                .datum(week.points)
                .attr('fill', 'none')
                .attr('stroke', 'hsl(var(--primary))')
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '4,4')
                .attr('stroke-opacity', 0.5)
                .attr('d', lineGenerator);
        });

        // Main line (keep existing)
        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'hsl(var(--primary))')
            .attr('stroke-width', 2)
            .attr('d', lineGenerator);

        svg.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', d => x(d.date))
            .attr('cy', d => y(d.value))
            .attr('r', 4)
            .attr('fill', 'hsl(var(--primary))')
            .attr('stroke', 'white')
            .attr('stroke-width', 2);

        // X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(axisBottom(x)
                .ticks(7)
                .tickFormat(d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })));

        // Y axis - only show whole numbers
        svg.append('g')
            .call(axisLeft(y)
                .ticks(totalHabits)  // Show ticks for each possible habit count
                .tickFormat(d => Math.floor(d).toString())  // Only show whole numbers
                .tickSize(0));  // Remove the tick lines
    }
</script>

<Card.Root>
    <Card.Header>
        <div class="flex justify-between items-center">
            <div>
                <Card.Title>Daily Habit Completion</Card.Title>
                <Card.Description>Overview of your habit completion rates</Card.Description>
            </div>
            <div class="flex gap-2">
                {#each ranges as range}
                    <Button 
                        variant={selectedRange === range ? "default" : "outline"}
                        size="sm"
                        on:click={() => selectedRange = range}
                    >
                        {range.label}
                    </Button>
                {/each}
            </div>
        </div>
    </Card.Header>
    <Card.Content>
        <div class="w-full p-4">
            {#if data.some(d => d.value > 0)}
                <div bind:this={chartElement} class="h-[400px] w-full" />
            {:else}
                <div class="text-center text-muted-foreground">
                    No completion data available for the last 14 days
                    {#if import.meta.env.DEV}
                        <pre class="text-left text-xs mt-4 p-2 bg-muted rounded">
                            Debug Info:
                            {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                    {/if}
                </div>
            {/if}
        </div>
    </Card.Content>
</Card.Root>

<style>
    :global(.x-axis text) {
        transform: rotate(-45deg);
        text-anchor: end;
    }
    :global(.tick line) {
        stroke: var(--muted);
        opacity: 0.2;
    }
    :global(.domain) {
        stroke: var(--muted);
    }
</style>