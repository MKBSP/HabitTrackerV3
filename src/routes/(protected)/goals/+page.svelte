<script lang="ts">
    import * as Card from '$lib/components/ui/card';
    import { page } from '$app/stores';

    let goals = [
        {
            id: 1,
            name: "Get in Shape",
            description: "Fitness and health goals for 2024",
            kpis: [
                { name: "Gym Sessions", target: 2, period: "week" },
                { name: "Running", target: 1, period: "week" }
            ]
        }
    ];
</script>

<div class="container mx-auto py-6">
    <Card.Root>
        <Card.Header>
            <Card.Title>Goals & KPIs</Card.Title>
            <Card.Description>Track your progress towards your goals</Card.Description>
        </Card.Header>
        <Card.Content>
            {#each goals as goal}
                <Card.Root class="mb-4">
                    <Card.Header>
                        <Card.Title>{goal.name}</Card.Title>
                        <Card.Description>{goal.description}</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <div class="space-y-2">
                            {#each goal.kpis as kpi}
                                <div class="flex justify-between items-center">
                                    <span>{kpi.name}</span>
                                    <span>{kpi.target} times per {kpi.period}</span>
                                </div>
                            {/each}
                        </div>
                    </Card.Content>
                </Card.Root>
            {/each}
        </Card.Content>
    </Card.Root>
</div>